import { getInfernoConversation } from '@/src/features/inferno/api/conversation';
import type { InfernoConversation } from '@/src/features/inferno/types';

/**
 * 회차의 대화를 읽는다. 화면은 데이터가 어디서 오는지 몰라도 된다.
 *
 * 지금은 상수라 동기로 곧장 돌려주지만, API 가 붙으면 이 안이 useQuery 로 바뀐다.
 * 그때 화면이 로딩·에러를 다뤄야 하므로 반환값은 객체로 감싸 둔다. 필드가 늘어도
 * 호출부가 구조 분해로 받고 있으면 그대로 굴러간다(§11).
 */
export default function useInfernoConversation(order: number): {
  conversation: InfernoConversation | undefined;
} {
  return { conversation: getInfernoConversation(order) };
}
