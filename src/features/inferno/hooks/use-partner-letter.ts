import { skipToken, useQuery } from '@tanstack/react-query';

import { fetchPartnerLetter } from '@/src/features/inferno/api/partner-letter';
import { partnerLetterKeys } from '@/src/features/inferno/api/query-keys';
import type { InfernoPartnerLetterSender } from '@/src/features/inferno/types';

/**
 * 쪽지 본문. "쪽지가 도착했어요" 안내가 뜨는 순간부터 받아 두어서, 열어보기를 누르면 기다리지 않고
 * 바로 펼쳐지게 한다.
 *
 * 본문은 AI 가 매번 다르게 써 주는 값이라, 같은 쪽지를 보는 동안 다시 받아서 문구가 바뀌면 안 된다.
 * 그래서 오래됐다고 다시 받지 않게(staleTime/gcTime 무한) 둔다.
 */
export default function usePartnerLetter(sender: InfernoPartnerLetterSender | null) {
  return useQuery({
    queryKey: partnerLetterKeys.letter(sender?.id ?? ''),
    queryFn: sender ? () => fetchPartnerLetter(sender) : skipToken,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
