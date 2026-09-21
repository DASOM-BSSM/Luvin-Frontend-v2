import { getInfernoSeasonSummary } from '@/src/features/inferno/api/season-summary';
import type { InfernoSeasonSummary } from '@/src/features/inferno/types';

interface UseInfernoSeasonSummaryResult {
  summary: InfernoSeasonSummary | undefined;
}

/** use-inferno-conversation 과 같은 자리 — API 가 붙으면 여기만 useQuery 로 바꾸면 된다(§11). */
export default function useInfernoSeasonSummary(order: number): UseInfernoSeasonSummaryResult {
  return { summary: getInfernoSeasonSummary(order) };
}
