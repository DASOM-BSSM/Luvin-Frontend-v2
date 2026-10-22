/** [DRAFT] Deterministic rules, no random rejection. */
import { PERSONAS } from '@/src/features/inferno/api/mocks/scene-cast';
import type {
  ChoicePoint,
  ChoiceRecord,
  SceneSeasonState,
} from '@/src/features/inferno/types/scene-block';
export function resolveChoice(
  state: SceneSeasonState,
  pointId: ChoicePoint,
  order: number,
  breadId: string | null,
  scenario: string,
): ChoiceRecord {
  const previous = state.choices.find((choice) => choice.pointId === pointId);
  if (previous) return previous;
  if (breadId === null)
    return { pointId, order, breadId, accepted: true, reason: '혼자만의 시간이 필요했어요.' };
  const persona = PERSONAS[breadId];
  const priorOther = state.choices.some(
    (choice) => choice.breadId !== null && choice.breadId !== breadId,
  );
  const affinity =
    (breadId === 'castella' ? 65 : breadId === 'donut' ? 35 : 50) +
    state.choices.filter((choice) => choice.breadId === breadId && choice.accepted).length * 15;
  const guaranteed =
    (state.rejectCount[breadId] ?? 0) >= 2 || scenario === 'all-accept' || breadId === 'friend';
  const reject =
    !guaranteed &&
    !(pointId === 2 && persona === 'avoidant') &&
    ((pointId === 3 && scenario === 'ep6-reject') ||
      (pointId !== 1 && persona === 'anxious' && priorOther) ||
      affinity < (pointId === 1 ? 30 : pointId === 3 ? 60 : 40));
  const reason =
    persona === 'avoidant'
      ? '마음은 있었지만 가까워지는 게 두려워 약속을 미뤘어요.'
      : persona === 'anxious' && priorOther
        ? '다른 사람을 먼저 고른 일이 서운했어요. 확인받으려 하기보다 말로 전했어야 했어요.'
        : '지금은 같은 마음으로 답하기 어려웠어요. 솔직하게 말하고 싶었어요.';
  return {
    pointId,
    order,
    breadId,
    accepted: !reject,
    reason: reject ? reason : '함께 이야기하고 싶었어요.',
  };
}
export function applyChoice(state: SceneSeasonState, record: ChoiceRecord): SceneSeasonState {
  if (state.choices.some((choice) => choice.pointId === record.pointId)) return state;
  return {
    route:
      record.pointId === 3 ? (record.breadId && record.accepted ? 'romance' : 'solo') : state.route,
    choices: [...state.choices, record],
    rejectCount: {
      ...state.rejectCount,
      ...(record.breadId && !record.accepted
        ? { [record.breadId]: (state.rejectCount[record.breadId] ?? 0) + 1 }
        : {}),
    },
  };
}
