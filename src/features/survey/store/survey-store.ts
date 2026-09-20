import { create } from 'zustand';

import { SURVEY_TOTAL_QUESTIONS } from '@/src/features/survey/constants/questions';
import type { SurveyAnswers, SurveyOptionId } from '@/src/features/survey/types';

/**
 * 진행 중인 설문의 상태.
 *
 * 메모리에만 둔다. 앱을 껐다 켜면 처음부터다. MMKV 래퍼(src/lib/storage.ts)는 이미 있으니
 * 이어서 풀게 하려면 옮기면 되는데, 중간에 끊긴 설문을 이어서 보여줄지가 아직 제품 결정으로
 * 정해지지 않아 그대로 둔다.
 */
interface SurveyStore {
  /** 지금 보고 있는 문항 번호(1부터). */
  currentNumber: number;
  answers: SurveyAnswers;
  /** 답을 기록한다. 이미 답한 문항이면 덮어쓴다. */
  answerQuestion: (questionNumber: number, optionId: SurveyOptionId) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  /** 설문을 처음부터 다시 시작한다. */
  resetSurvey: () => void;
}

export const useSurveyStore = create<SurveyStore>((set) => ({
  currentNumber: 1,
  answers: {},

  answerQuestion: (questionNumber, optionId) =>
    set((state) => ({ answers: { ...state.answers, [questionNumber]: optionId } })),

  // 양 끝에서 더 가지 않는다. 마지막 문항 다음과 첫 문항 이전은 화면 쪽이 처리한다.
  goToNextQuestion: () =>
    set((state) => ({ currentNumber: Math.min(state.currentNumber + 1, SURVEY_TOTAL_QUESTIONS) })),

  goToPreviousQuestion: () =>
    set((state) => ({ currentNumber: Math.max(state.currentNumber - 1, 1) })),

  resetSurvey: () => set({ currentNumber: 1, answers: {} }),
}));
