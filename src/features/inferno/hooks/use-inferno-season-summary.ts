import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/src/features/auth/store/auth-store";
import type { BreadProfile } from "@/src/features/home/types";
import { simulationKeys } from "@/src/features/inferno/api/query-keys";
import { getInfernoSeasonSummary } from "@/src/features/inferno/api/season-summary";
import {
  getSimulationHighlights,
  getSimulationReport,
} from "@/src/features/inferno/api/simulation";
import useAiEpisodeMessages from "@/src/features/inferno/hooks/use-ai-episode-messages";
import useAiSeasonStatus from "@/src/features/inferno/hooks/use-ai-season-status";
import type { InfernoSeasonSummary } from "@/src/features/inferno/types";
import { mapAiEpisodeToConversation } from "@/src/features/inferno/utils/map-ai-episode";
import {
  mapFinalMatchFromEp4,
  mapSimulationHighlights,
  mapSimulationReport,
} from "@/src/features/inferno/utils/map-ai-season-report";

interface UseInfernoSeasonSummaryResult {
  summary: InfernoSeasonSummary | undefined;
  isLoading: boolean;
  isError: boolean;
}

/**
 * ep5 하나뿐이라 "AI 연결된 회차" 집합을 따로 두지 않는다 — order 가 5가 아니면(있을 수 없지만
 * 타입상 열려 있어) 그냥 로컬 값을 돌려준다.
 *
 * `report`/`highlights`는 `GET /api/simulation/*`, `finalMatch`는 ep4 데이터(마지막 매칭
 * 회차)에서 뽑는다(map-ai-season-report.ts 주석 참고) — 그래서 시즌 상태·ep4 회차 메시지도
 * 같이 받아야 한다.
 */
export default function useInfernoSeasonSummary(
  order: number,
  myProfile: BreadProfile | null,
): UseInfernoSeasonSummaryResult {
  const isAiConnected = order === 5;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const seasonQuery = useAiSeasonStatus();
  const ep4Query = useAiEpisodeMessages(4, isAiConnected);
  const reportQuery = useQuery({
    queryKey: simulationKeys.report,
    queryFn: getSimulationReport,
    enabled: isAuthenticated && isAiConnected,
  });
  const highlightsQuery = useQuery({
    queryKey: simulationKeys.highlights,
    queryFn: getSimulationHighlights,
    enabled: isAuthenticated && isAiConnected,
  });

  if (!isAiConnected) {
    return {
      summary: getInfernoSeasonSummary(order),
      isLoading: false,
      isError: false,
    };
  }

  const ep4Conversation =
    seasonQuery.data && ep4Query.data
      ? mapAiEpisodeToConversation(seasonQuery.data, ep4Query.data, myProfile)
      : undefined;
  const finalMatch = seasonQuery.data
    ? mapFinalMatchFromEp4(ep4Conversation, seasonQuery.data)
    : undefined;

  const summary: InfernoSeasonSummary | undefined =
    finalMatch && reportQuery.data && highlightsQuery.data
      ? {
          episodeOrder: 5,
          finalMatch,
          report: mapSimulationReport(reportQuery.data),
          highlights: mapSimulationHighlights(highlightsQuery.data),
        }
      : undefined;

  return {
    summary,
    isLoading:
      seasonQuery.isLoading ||
      ep4Query.isLoading ||
      reportQuery.isLoading ||
      highlightsQuery.isLoading,
    isError:
      seasonQuery.isError ||
      ep4Query.isError ||
      reportQuery.isError ||
      highlightsQuery.isError,
  };
}
