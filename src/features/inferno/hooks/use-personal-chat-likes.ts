import useAiSeasonStatus from '@/src/features/inferno/hooks/use-ai-season-status';
import { useInfernoLikeStore } from '@/src/features/inferno/store/like-store';

/** 빈 목록을 매번 새로 만들지 않게 하나를 나눠 쓴다(zustand 셀렉터가 같은 값을 돌려줘야 한다). */
const NO_LIKES: string[] = [];

/**
 * 1:1 대화(ep2·ep4)의 하트. 이 회차에서 하트를 누른 줄 id 목록과, 줄 하나의 하트를 켜고 끄는
 * 함수를 돌려준다. 시즌을 아직 모르면 목록은 비어 있고 눌러도 아무 일도 하지 않는다.
 */
export default function usePersonalChatLikes(order: number) {
  const seasonId = useAiSeasonStatus().data?.seasonId;
  const likedMessageIds = useInfernoLikeStore((state) =>
    seasonId ? (state.likes[seasonId]?.[order] ?? NO_LIKES) : NO_LIKES,
  );
  const toggleLike = useInfernoLikeStore((state) => state.toggleLike);

  function toggle(messageId: string) {
    if (seasonId) {
      toggleLike(seasonId, order, messageId);
    }
  }

  return { likedMessageIds, toggle };
}
