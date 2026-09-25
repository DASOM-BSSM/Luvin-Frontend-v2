import { getInfernoConversation } from '@/src/features/inferno/api/conversation';
import { useBreadStore } from '@/src/features/bread/store/bread-store';
import useAiEpisodeMessages from '@/src/features/inferno/hooks/use-ai-episode-messages';
import useAiSeasonStatus from '@/src/features/inferno/hooks/use-ai-season-status';
import type { InfernoConversation } from '@/src/features/inferno/types';
import { mapAiEpisodeToConversation } from '@/src/features/inferno/utils/map-ai-episode';

/**
 * ep1·ep2 를 실제 AI 시즌 API로 연결했다 — ep3~4 는 아직 매퍼가 없어서(ep3 는 미니게임
 * 결과 제출, ep4 는 "다시 굽기"가 더 필요) 그대로 로컬 대본(conversation.ts)을 쓴다.
 * 패턴이 검증되면 이 목록에 episode 를 늘리고 매퍼도 그만큼 넓힐 것.
 */
const AI_CONNECTED_EPISODES = new Set([1, 2]);

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
