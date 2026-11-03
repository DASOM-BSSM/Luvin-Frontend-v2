/**
 * [DRAFT] 안 읽은 회차 쪽지. 발신 빵 이름은 시즌 출연진과 맞춰 붙인다(utils/map-story 의
 * mapPartnerLetter). 읽음으로 표시하면 다음 안 읽은 쪽지를 다시 받는다. 1~9화를 완료한 직후에는 쪽지가
 * 도착할 때까지 잠시 짧은 간격으로 다시 받는다(letter-wait-store).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getUnreadLetter, markLetterRead } from '@/src/features/inferno/api/partner-letter';
import { partnerLetterKeys } from '@/src/features/inferno/api/query-keys';
import useAiSeasonStatus from '@/src/features/inferno/hooks/use-ai-season-status';
import useCompletionWatcher from '@/src/features/inferno/hooks/use-completion-watcher';
import { useLetterWaitStore } from '@/src/features/inferno/store/letter-wait-store';
import { shouldPollLetter } from '@/src/features/inferno/utils/completion';
import { mapPartnerLetter } from '@/src/features/inferno/utils/map-story';

const LETTER_POLL_MS = 2000;

export default function usePartnerLetter() {
  const client = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const status = useAiSeasonStatus();
  // 쪽지는 회차 완료가 끝나야 생긴다. 이 훅은 루트 레이아웃에 늘 붙어 있어서 완료 확인도 여기서 같이 돈다.
  useCompletionWatcher();
  const waitUntil = useLetterWaitStore((state) => state.waitUntil);
  const stopWaitingLetter = useLetterWaitStore((state) => state.stopWaiting);
  const query = useQuery({
    queryKey: partnerLetterKeys.unread,
    queryFn: getUnreadLetter,
    enabled: isAuthenticated,
    refetchInterval: (current) =>
      shouldPollLetter(waitUntil, Date.now(), Boolean(current.state.data)) ? LETTER_POLL_MS : false,
  });
  const read = useMutation({
    mutationFn: markLetterRead,
    onSuccess: () => {
      // 기다리던 쪽지를 읽었으니 더 기다리지 않는다(남은 기한 동안 빈 응답을 다시 받지 않게).
      stopWaitingLetter();
      void client.invalidateQueries({ queryKey: partnerLetterKeys.unread });
    },
  });
  // 출연진을 받는 중에는 이름을 판단하지 않는다(받고 나면 다시 계산된다).
  const letter =
    query.data && !status.isLoading ? mapPartnerLetter(query.data, status.data?.characters) : null;
  const missingReason = letter?.senderMissingReason ?? null;
  const letterId = letter?.letterId ?? null;
  const partnerId = query.data?.partnerId ?? null;

  // 발신 빵 이름을 못 찾으면 "From." 줄을 빈칸으로 두지 않고 숨기고, 이유를 남긴다(사용자 요청).
  // TODO(§14): 크래시 리포팅이 붙으면 console 대신 그쪽으로 보낼 것.
  useEffect(() => {
    if (__DEV__ && missingReason)
      console.warn(
        `[partner-letter] 발신 빵 이름 없음: reason=${missingReason} letterId=${letterId} partnerId=${partnerId}`,
      );
  }, [missingReason, letterId, partnerId]);

  return { query, letter, read };
}
