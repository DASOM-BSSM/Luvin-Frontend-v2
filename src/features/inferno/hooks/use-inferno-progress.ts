import useAiSeasonStatus from '@/src/features/inferno/hooks/use-ai-season-status';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import { useSceneSeasonStore } from '@/src/features/inferno/store/scene-season-store';

/** [DRAFT] Ten-episode draft progression is independent of legacy server counters.
 * Incomplete mock runs restart at episode one after process restart, matching the lifetime
 * of the choice state. A finished season retains its existing persisted completion record.
 */
export default function useInfernoProgress() {
  const localOrders = useInfernoStore((state) => state.completedOrders);
  const seasonQuery = useAiSeasonStatus();
  const owner = useInfernoStore((state) => state.ownerUserId);
  const key = `${owner ?? 'guest'}:${seasonQuery.data?.seasonId ?? 'draft'}`;
  const completed = useSceneSeasonStore((state) => state.sessions[key]?.completedOrders);
  // [DRAFT] Old server completion and saved five-episode progress cannot unlock this story.
  // Draft choices and completion share a session lifetime; after restart resume at episode one.
  const guide = localOrders.includes(0) ? [0] : [];

  return {
    completedOrders: localOrders.includes(10)
      ? localOrders
      : [...guide, ...(completed ?? [])].sort((a, b) => a - b),
    /**
     * 기기 기록이 없는데 서버 진행도를 아직 받는 중. 이때 진행도로 화면을 정하면 "처음" 으로 보였다가
     * 바뀌어 깜빡인다 — 홈은 이 동안 스켈레톤을 보여준다. 기기 기록이 있으면 그걸로 먼저 보여준다.
     */
    isSyncing: localOrders.length === 0 && seasonQuery.isLoading,
  };
}
