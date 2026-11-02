/**
 * 회차 완료를 뒤에서 지켜본다(앱 전체, partner-letter-modal 을 거쳐 루트 레이아웃에 붙는다).
 *
 * 1~9화는 완료 요청만 보내고 바로 나가므로(사용자 요청), 서버가 정리하는 동안 `GET /me` 를 2.5초마다
 * 다시 받는다. 정리가 끝나면 쪽지와 다음 회차 본문을 새로 받고, 실패하면 완료 요청을 다시 보낸다
 * (서버는 실패하면 아무것도 저장하지 않아서 다시 보내면 처음부터 다시 시도한다).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getSeasonStatus } from '@/src/features/inferno/api/ai-season';
import type { AiSeasonStatusView } from '@/src/features/inferno/api/ai-season-types';
import { aiSeasonKeys, partnerLetterKeys, storyKeys } from '@/src/features/inferno/api/query-keys';
import { requestEpisodeCompletion } from '@/src/features/inferno/api/story';
import {
  failedCompletionOrder,
  isCompletionSettled,
} from '@/src/features/inferno/utils/completion';
import { mapStoryState } from '@/src/features/inferno/utils/map-story';

const WATCH_INTERVAL_MS = 2500;
/** 한 회차의 실패를 앱이 자동으로 다시 보내는 횟수. 넘으면 다음 회차 진입 때 이전 회차로 안내된다. */
const AUTO_RETRY_LIMIT = 2;

export default function useCompletionWatcher() {
  const client = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const season = useQuery({
    queryKey: aiSeasonKeys.status,
    queryFn: getSeasonStatus,
    enabled: isAuthenticated,
    refetchInterval: (query) =>
      query.state.data?.story?.completion?.status === 'completing' ? WATCH_INTERVAL_MS : false,
  });
  const story = season.data ? mapStoryState(season.data.story) : undefined;
  /** 정리 중이던 회차. 끝난 걸 알아채려고 기억해 둔다. */
  const [watchingOrder, setWatchingOrder] = useState<number | null>(null);
  const retries = useRef<Record<number, number>>({});
  const resend = useMutation({
    mutationFn: requestEpisodeCompletion,
    onSuccess: ({ seasonView }) => {
      client.setQueryData<AiSeasonStatusView>(aiSeasonKeys.status, (current) =>
        current ? { ...current, story: seasonView } : current,
      );
    },
  });

  const completingOrder = story?.completion?.order ?? null;
  const failedOrder = failedCompletionOrder(story);
  const settled = watchingOrder !== null && isCompletionSettled(watchingOrder, story);

  // 서버 상태가 바뀔 때만 반응한다: 진행 중인 회차를 기억한다.
  useEffect(() => {
    if (completingOrder !== null) setWatchingOrder(completingOrder);
  }, [completingOrder]);

  // 정리가 끝나면 쪽지와 다음 회차 본문을 새로 받는다(그 전에 받은 409 를 남겨두지 않는다).
  useEffect(() => {
    if (!settled || watchingOrder === null) return;
    setWatchingOrder(null);
    void client.invalidateQueries({ queryKey: partnerLetterKeys.unread });
    void client.invalidateQueries({ queryKey: storyKeys.content(watchingOrder + 1) });
  }, [client, settled, watchingOrder]);

  // 실패하면 정해진 횟수까지 완료 요청을 다시 보낸다.
  useEffect(() => {
    if (failedOrder === null || resend.isPending) return;
    const count = retries.current[failedOrder] ?? 0;
    if (count >= AUTO_RETRY_LIMIT) return;
    retries.current[failedOrder] = count + 1;
    resend.mutate(failedOrder);
  }, [failedOrder, resend]);
}
