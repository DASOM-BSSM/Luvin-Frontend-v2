/**
 * [DRAFT] 회차 본문. `status: 'generating'` 이면 2초마다 다시 요청하고, 60초를 넘기면
 * EpisodeGenerationTimeoutError 로 멈춰서 "다시 시도" 버튼을 띄운다(보정 문서 3장).
 * `failed` 도 오류로 바꿔서 같은 버튼을 쓴다 — 다시 요청하면 서버가 다시 만든다.
 */
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';

import { getEpisodeContent } from '@/src/features/inferno/api/story';
import { storyKeys } from '@/src/features/inferno/api/query-keys';
import { useBreadStore } from '@/src/features/bread/store/bread-store';
import { EpisodeGenerationTimeoutError } from '@/src/features/inferno/utils/story-error';

const POLL_INTERVAL_MS = 2000;
const POLL_LIMIT_MS = 60000;

export class EpisodeGenerationFailedError extends Error {
  constructor() {
    super('Episode generation failed');
    this.name = 'EpisodeGenerationFailedError';
  }
}

export default function useEpisodeContent(order: number, enabled = true) {
  const myBreadType = useBreadStore((state) => state.profile?.type);
  /** 생성 대기를 처음 본 시각. 다시 시도하면 비운다. */
  const waitingSince = useRef<number | null>(null);

  const query = useQuery({
    queryKey: storyKeys.content(order),
    enabled,
    // 생성 대기·실패는 아래에서 직접 다룬다. 같은 실패를 자동으로 또 부르지 않는다.
    retry: false,
    queryFn: async () => {
      const content = await getEpisodeContent(order, { myBreadType });
      if (content.status === 'failed') throw new EpisodeGenerationFailedError();
      if (content.status === 'generating') {
        waitingSince.current ??= Date.now();
        if (Date.now() - waitingSince.current > POLL_LIMIT_MS) throw new EpisodeGenerationTimeoutError();
      } else {
        waitingSince.current = null;
      }
      return content;
    },
    refetchInterval: (current) =>
      current.state.data?.status === 'generating' ? POLL_INTERVAL_MS : false,
  });

  function retry() {
    waitingSince.current = null;
    return query.refetch();
  }

  return { ...query, isGenerating: query.data?.status === 'generating', retry };
}
