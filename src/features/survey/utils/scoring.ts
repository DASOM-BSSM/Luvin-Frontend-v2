import { SURVEY_QUESTIONS } from '@/src/features/survey/constants/questions';
import { SURVEY_TRAITS } from '@/src/features/survey/constants/traits';
import type { SurveyAnswers, SurveyTrait, TraitScores } from '@/src/features/survey/types';

/** 지표 13종이 전부 0 인 점수표. */
export function createEmptyTraitScores(): TraitScores {
  return Object.fromEntries(SURVEY_TRAITS.map((trait) => [trait, 0])) as TraitScores;
}

/**
 * 고른 보기들의 증감을 전부 더한 성향 점수.
 *
 * 아직 답하지 않은 문항은 건너뛰기 때문에 설문 도중의 중간 점수도 그대로 계산된다.
 * 훅도 저장소도 건드리지 않는 순수 함수다(§6).
 */
export function calculateTraitScores(answers: SurveyAnswers): TraitScores {
  const scores = createEmptyTraitScores();

  for (const question of SURVEY_QUESTIONS) {
    const chosenId = answers[question.number];
    if (!chosenId) {
      continue;
    }

    const chosen = question.options.find((option) => option.id === chosenId);
    if (!chosen) {
      continue;
    }

    for (const [trait, delta] of Object.entries(chosen.deltas) as [SurveyTrait, number][]) {
      scores[trait] += delta;
    }
  }

  return scores;
}

/** 20문항을 빠짐없이 답했는지. */
export function isSurveyComplete(answers: SurveyAnswers): boolean {
  return SURVEY_QUESTIONS.every((question) => Boolean(answers[question.number]));
}

/** 답한 문항 수. 진행률 표시에 쓴다. */
export function countAnsweredQuestions(answers: SurveyAnswers): number {
  return SURVEY_QUESTIONS.filter((question) => Boolean(answers[question.number])).length;
}
