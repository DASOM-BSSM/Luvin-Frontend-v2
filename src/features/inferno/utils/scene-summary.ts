/**
 * [DRAFT] 10화 뒤 최종 리포트 화면에 넘길 요약.
 *
 * 내용은 서버 최종 리포트(`GET /api/ai/seasons/report`, 기존 형식 그대로)를 쓰고(mergeSeasonReport),
 * 리포트에 하이라이트가 없을 때만 서버 `story` 의 선택 기록으로 채운다(buildSceneSummary).
 */
import type { AiReportView } from '@/src/features/inferno/api/ai-season-types';
import type { InfernoParticipant, InfernoSeasonSummary } from '@/src/features/inferno/types';
import { mapAiHighlights, mapAiReport } from '@/src/features/inferno/utils/map-ai-season-report';
import type { StoryState } from '@/src/features/inferno/types/story';

export function buildSceneSummary(
  state: StoryState,
  cast: InfernoParticipant[],
): InfernoSeasonSummary {
  const nameOf = (breadId: string | null) =>
    cast.find((person) => person.id === breadId)?.name ?? '상대';
  const others = cast.filter((person) => !person.isMine);
  const partner =
    cast.find((person) => person.id === state.romancePartnerId) ?? others[0] ?? cast[0];
  const romance = state.route === 'romance';
  const conflict = state.choices.find((choice) => choice.pointId === 4);
  return {
    episodeOrder: 10,
    finalMatch: {
      profile: partner ?? { id: '', type: 'cream', name: '', isMine: false },
      summaryLine: romance
        ? '서로의 속도를 알아가며 마음을 나눴어요'
        : '나를 돌보며 소중한 관계를 남겼어요',
    },
    report: {
      tendency: `이번 시즌에는 ${romance ? '마음을 전하고 서로의 차이를 알아갔어요.' : '혼자만의 시간과 관계 사이에서 나만의 속도를 찾아갔어요.'} 갈등 뒤에는 ${conflict?.breadId ? `${nameOf(conflict.breadId)}와 이야기할 기회를 골랐어요.` : '혼자 생각을 정리하는 시간을 골랐어요.'} 선택에는 정답이 없어요. 다음에도 내 마음과 상대의 경계를 함께 존중해봐요.`,
      feedback: '내 마음과 상대의 경계를 함께 존중해봐요.',
      strengths: [],
      weaknesses: [],
    },
    highlights:
      state.choices.length === 0
        ? [{ text: '이 시즌의 선택 기록이 아직 없어요.' }]
        : state.choices.map((choice) => ({
            episodeOrder: choice.order,
            text: `${choice.order}화 · ${choice.breadId === null ? '혼자만의 시간을 골랐어요.' : `${nameOf(choice.breadId)}에게 마음을 전했어요. ${choice.accepted ? '대화를 나눴어요.' : '상대의 답을 존중하고 마음을 돌봤어요.'}`}`,
          })),
  };
}

/**
 * 최종 리포트를 요약에 얹는다. 최종 상대는 `finalPartnerId` 를 이 시즌 출연진에서 찾는다.
 * 솔로일 때 최종 상대 표시는 백엔드 안내 전까지 기존 화면 동작을 그대로 둔다(보정 문서 8장).
 */
export function mergeSeasonReport(
  base: InfernoSeasonSummary,
  report: AiReportView,
  cast: InfernoParticipant[],
): InfernoSeasonSummary {
  const partner = cast.find((person) => person.id === report.finalPartnerId);
  const highlights = mapAiHighlights(report.highlights);
  return {
    ...base,
    finalMatch: partner ? { ...base.finalMatch, profile: partner } : base.finalMatch,
    report: mapAiReport(report),
    highlights: highlights.length > 0 ? highlights : base.highlights,
  };
}
