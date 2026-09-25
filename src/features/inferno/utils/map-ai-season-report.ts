import type { AiSeasonStatusView } from '@/src/features/inferno/api/ai-season-types';
import type { SimulationHighlightView, SimulationReportView } from '@/src/features/inferno/api/simulation-types';
import type { InfernoConversation, InfernoFinalMatchResult, InfernoHighlight, InfernoSeasonReport } from '@/src/features/inferno/types';
import { findMatchedPartner } from '@/src/features/inferno/utils/map-ai-episode';

/** `GET /api/simulation/report` 응답을 화면이 쓰는 모양으로 바꾼다. 지금은 필드가 1:1이라 그대로 옮기기만 한다. */
export function mapSimulationReport(report: SimulationReportView): InfernoSeasonReport {
  return {
    summary: report.summary,
    strength: report.strength,
    weakness: report.weakness,
    advice: report.advice,
  };
}

/**
 * `GET /api/simulation/highlights` 응답을 화면이 쓰는 모양으로 바꾸고, 중요도(`importance`)
 * 높은 순으로 정렬한다 — 화면(inferno-highlight-scene.tsx)은 이 순서를 그대로 보여준다.
 */
export function mapSimulationHighlights(highlights: SimulationHighlightView[]): InfernoHighlight[] {
  return [...highlights]
    .sort((a, b) => b.importance - a.importance)
    .map((highlight) => ({
      episodeId: highlight.episodeId,
      title: highlight.title,
      summary: highlight.summary,
      importance: highlight.importance,
    }));
}

/**
 * ep5 "최종 매칭"을 ep4(시즌의 마지막 매칭 회차) 데이터에서 뽑는다. `GET /api/simulation/report`엔
 * 이 정보가 없어서(season-summary.ts 주석 참고) 새 엔드포인트 대신 이미 연결된 ep4 데이터를
 * 재사용한다.
 *
 * "다시 굽기"(상대를 바꾸는 곁가지)는 아직 API 연동이 안 돼 있어서, 유저가 ep4에서 다시
 * 굽기를 썼다면 그 이후 바뀐 진짜 최종 상대가 아니라 다시 굽기 전 매칭 상대가 나온다 —
 * 다시 굽기가 연결되기 전까지는 어쩔 수 없는 한계다.
 */
export function mapFinalMatchFromEp4(
  ep4Conversation: InfernoConversation | undefined,
  season: AiSeasonStatusView,
): InfernoFinalMatchResult | undefined {
  if (!ep4Conversation) {
    return undefined;
  }

  const partner = findMatchedPartner(ep4Conversation);
  const character = season.characters.find((candidate) => candidate.characterId === partner?.id);
  if (!partner || !character) {
    return undefined;
  }

  return {
    profile: { type: partner.type, name: partner.name, attachmentLabel: character.personality },
    summaryLine: `이 시즌, 당신의 분신은 ${character.personality} 성향과 이어졌어요`,
  };
}
