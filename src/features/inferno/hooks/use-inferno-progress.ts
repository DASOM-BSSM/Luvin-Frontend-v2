import useAiSeasonStatus from '@/src/features/inferno/hooks/use-ai-season-status';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import { mergeCompletedOrders } from '@/src/features/inferno/utils/progress';

/**
 * 끝낸 회차들. 기기 기록(`useInfernoStore.completedOrders`)과 서버 시즌 상태(`GET /api/ai/seasons/me`)를
 * 합친다(utils/progress 의 mergeCompletedOrders 참고).
 *
 * 기기 기록만 보면 로그아웃했다 다시 로그인했을 때 진행도가 처음부터로 돌아갔다(LUV-56) — 기기 기록은
 * 계정 전환 때 지워지기 때문이다. 서버 상태를 아직 못 받았으면 기기 기록만으로 판단한다.
 */
export default function useInfernoProgress() {
  const localOrders = useInfernoStore((state) => state.completedOrders);
  const seasonQuery = useAiSeasonStatus();

  return {
    completedOrders: mergeCompletedOrders(localOrders, seasonQuery.data),
    /**
     * 기기 기록이 없는데 서버 진행도를 아직 받는 중. 이때 진행도로 화면을 정하면 "처음" 으로 보였다가
     * 바뀌어 깜빡인다 — 홈은 이 동안 스켈레톤을 보여준다. 기기 기록이 있으면 그걸로 먼저 보여준다.
     */
    isSyncing: localOrders.length === 0 && seasonQuery.isLoading,
  };
}
