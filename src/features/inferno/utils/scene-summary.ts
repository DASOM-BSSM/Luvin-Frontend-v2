/** [DRAFT] Mock report derived from the same immutable choice history as interviews. */
import { SCENE_CAST } from '@/src/features/inferno/api/mocks/scene-cast';
import type { InfernoSeasonSummary } from '@/src/features/inferno/types';
import type { SceneSeasonState } from '@/src/features/inferno/types/scene-block';
export function buildSceneSummary(state: SceneSeasonState): InfernoSeasonSummary {
  const confession = state.choices.find((choice) => choice.pointId === 3);
  const partner =
    SCENE_CAST.find(
      (person) => person.id === (state.route === 'romance' ? confession?.breadId : 'friend'),
    ) ?? SCENE_CAST[1];
  const conflict = state.choices.find((choice) => choice.pointId === 4);
  return {
    episodeOrder: 10,
    finalMatch: {
      profile: partner,
      summaryLine:
        state.route === 'romance'
          ? '서로의 속도를 알아가며 마음을 나눴어요'
          : '나를 돌보며 소중한 관계를 남겼어요',
    },
    report: {
      tendency: `이번 시즌에는 ${state.route === 'romance' ? '마음을 전하고 서로의 차이를 알아갔어요.' : '혼자만의 시간과 관계 사이에서 나만의 속도를 찾아갔어요.'} 갈등 뒤에는 ${conflict?.breadId === null ? '혼자 생각을 정리하는 시간을 골랐어요.' : conflict?.breadId === 'friend' ? '친구에게 마음을 털어놓았어요.' : '상대와 직접 대화할 기회를 골랐어요.'} 선택에는 정답이 없어요. 다음에도 내 마음과 상대의 경계를 함께 존중해봐요.`,
      feedback: '내 마음과 상대의 경계를 함께 존중해봐요.',
      strengths: [],
      weaknesses: [],
    },
    highlights:
      state.choices.length === 0
        ? [{ text: '이 시즌의 선택 기록이 이번 실행에는 남아 있지 않아요.' }]
        : state.choices.map((choice) => ({
            episodeOrder: choice.order,
            text: `${choice.order}화 · ${choice.breadId === null ? '혼자만의 시간을 골랐어요.' : `${SCENE_CAST.find((person) => person.id === choice.breadId)?.name ?? '상대'}에게 마음을 전했어요. ${choice.accepted ? '대화를 나눴어요.' : '상대의 답을 존중하고 마음을 돌봤어요.'}`}`,
          })),
  };
}
