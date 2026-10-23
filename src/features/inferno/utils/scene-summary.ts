/**
 * [DRAFT] 10화 뒤 리포트 화면에 넘길 임시 요약. 서버 `story`(선택 기록·경로)로 만든다.
 * 실제 최종 리포트(`GET /api/ai/seasons/report`)로 바꾸기 전까지만 쓴다.
 */
import type { InfernoParticipant, InfernoSeasonSummary } from '@/src/features/inferno/types';
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
