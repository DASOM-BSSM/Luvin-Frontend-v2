/**
 * [DRAFT] 안 읽은 회차 쪽지. 발신 빵 이름은 시즌 출연진과 맞춰 붙인다(utils/map-story 의
 * mapPartnerLetter). 읽음으로 표시하면 다음 안 읽은 쪽지를 다시 받는다.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getUnreadLetter, markLetterRead } from '@/src/features/inferno/api/partner-letter';
import { partnerLetterKeys } from '@/src/features/inferno/api/query-keys';
import useAiSeasonStatus from '@/src/features/inferno/hooks/use-ai-season-status';
import { mapPartnerLetter } from '@/src/features/inferno/utils/map-story';

export default function usePartnerLetter() {
  const client = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const status = useAiSeasonStatus();
  const query = useQuery({
    queryKey: partnerLetterKeys.unread,
    queryFn: getUnreadLetter,
    enabled: isAuthenticated,
  });
  const read = useMutation({
    mutationFn: markLetterRead,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: partnerLetterKeys.unread });
    },
  });
  const letter = query.data ? mapPartnerLetter(query.data, status.data?.characters) : null;
  return { query, letter, read };
}
