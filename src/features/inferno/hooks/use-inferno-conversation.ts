import { getInfernoConversation } from '@/src/features/inferno/api/conversation';
import { useBreadStore } from '@/src/features/bread/store/bread-store';
import useAiEpisodeMessages from '@/src/features/inferno/hooks/use-ai-episode-messages';
import useAiSeasonStatus from '@/src/features/inferno/hooks/use-ai-season-status';
import type { InfernoConversation } from '@/src/features/inferno/types';
import { mapAiEpisodeToConversation } from '@/src/features/inferno/utils/map-ai-episode';

/**
 * ep1~4 모두 실제 AI 시즌 API로 연결했다. ep4 의 "다시 굽기"(rebake)만 예외로, 새
 * 1:1 대화가 API 로 어떻게 내려오는지 알 방법이 없어서 `conversation.rebake` 가 항상
 * undefined 다 — 화면(ep4.tsx)이 "다시 굽기" 버튼 자체를 숨겨서 그 경로로 못 들어가게
 * 막아 둔다. 실제 동작은 API 응답을 보고 나서 채울 것(map-ai-episode.ts 주석 참고).
 */
const AI_CONNECTED_EPISODES = new Set([1, 2, 3, 4]);

/**
 * 회차의 대화를 읽는다. 화면은 데이터가 어디서 오는지 몰라도 된다.
 *
 * AI 시즌 상태(참가자)와 회차 메시지를 둘 다 받아와 화면이 이미 알던 `InfernoConversation`
 * 모양으로 합친다. 메시지가 아직 생성 전이면(`messages` 빈 배열) `conversation`은
 * `undefined`고 `isLoading`이 true — 화면은 이 동안 "만들고 있어요" 같은 안내를 보여줘야
 * 한다(§11, 빈 화면 금지).
 */
export default function useInfernoConversation(order: number): {
  conversation: InfernoConversation | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const isAiConnected = AI_CONNECTED_EPISODES.has(order);
  const myProfile = useBreadStore((state) => state.profile);
  const statusQuery = useAiSeasonStatus();
  const episodeQuery = useAiEpisodeMessages(order, isAiConnected);

  if (!isAiConnected) {
    return { conversation: getInfernoConversation(order), isLoading: false, isError: false };
  }

  const hasMessages = (episodeQuery.data?.messages.length ?? 0) > 0;
  const conversation =
    statusQuery.data && episodeQuery.data && hasMessages
      ? mapAiEpisodeToConversation(statusQuery.data, episodeQuery.data, myProfile)
      : undefined;

  return {
    conversation,
    isLoading: statusQuery.isLoading || episodeQuery.isLoading || (episodeQuery.isSuccess && !hasMessages),
    isError: statusQuery.isError || episodeQuery.isError,
  };
}
