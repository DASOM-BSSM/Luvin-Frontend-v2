import useStoryState from '@/src/features/inferno/hooks/use-story-state';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';

/**
 * [DRAFT] 완료한 회차. 1~10화는 서버 `story.completedOrders` 가 기준이다(보정 문서 5장).
 * 가이드 ep0 는 서버가 모르는 회차라 기기 기록을 그대로 쓴다.
 */
export default function useInfernoProgress() {
  const localOrders = useInfernoStore((state) => state.completedOrders);
  const storyQuery = useStoryState();
  const guide = localOrders.includes(0) ? [0] : [];

  return {
    completedOrders: [...guide, ...(storyQuery.data?.completedOrders ?? [])].sort((a, b) => a - b),
    /**
     * 서버 진행도를 아직 받는 중. 이때 진행도로 화면을 정하면 "처음" 으로 보였다가 바뀌어
     * 깜빡인다 — 홈은 이 동안 스켈레톤을 보여준다.
     */
    isSyncing: storyQuery.isLoading,
  };
}
