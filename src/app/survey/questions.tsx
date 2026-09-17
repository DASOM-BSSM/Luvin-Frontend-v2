import { Redirect, router } from 'expo-router';
import { View } from 'react-native';

import BottomNav from '@/src/components/bottom-nav';
import Text from '@/src/components/ui/text';
import SurveyOptionCard from '@/src/features/survey/components/survey-option-card';
import SurveyProgressHeader from '@/src/features/survey/components/survey-progress-header';
import {
  SURVEY_QUESTIONS,
  SURVEY_TOTAL_QUESTIONS,
} from '@/src/features/survey/constants/questions';
import { useSurveyStore } from '@/src/features/survey/store/survey-store';
import type { SurveyOptionId } from '@/src/features/survey/types';
import { formatQuestionNumber } from '@/src/features/survey/utils/format';

/**
 * 설문 문항 화면. Figma "Luvin-Design" / `설문-우린` (5726:2582).
 *
 * 문항 20개가 이 한 화면을 돌려 쓰고, 몇 번째인지는 스토어가 들고 있다.
 * 보기를 누르면 바로 다음 문항으로 넘어간다 — Figma 에 확인 버튼이 없다.
 *
 * 세로 배치는 Figma 프레임(402 x 874) 기준이다.
 * 상단 70 과 하단 44 는 고정, 남는 공간은 문항 아래와 보기 아래로 Figma 비율(240 : 49)로 나눈다.
 */
export default function SurveyQuestionsScreen() {
  const currentNumber = useSurveyStore((state) => state.currentNumber);
  const answerQuestion = useSurveyStore((state) => state.answerQuestion);
  const goToNextQuestion = useSurveyStore((state) => state.goToNextQuestion);
  const goToPreviousQuestion = useSurveyStore((state) => state.goToPreviousQuestion);

  const question = SURVEY_QUESTIONS[currentNumber - 1];

  function handleBackPress() {
    // 첫 문항에서의 뒤로가기는 문항 이동이 아니라 설문을 빠져나가는 것이다.
    if (currentNumber > 1) {
      goToPreviousQuestion();
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/survey');
  }

  function handleOptionSelect(optionId: SurveyOptionId) {
    answerQuestion(currentNumber, optionId);

    if (currentNumber === SURVEY_TOTAL_QUESTIONS) {
      // TODO: 결과 화면으로 이동하고 답안을 제출한다.
      // 결과 화면 디자인과 HTTP 클라이언트가 정해져야 붙일 수 있다(§2, §11).
      // 답은 스토어에 남아 있어서, 결과 화면이 calculateTraitScores 로 바로 점수를 낼 수 있다.
      return;
    }

    goToNextQuestion();
  }

  // 스토어가 범위를 벗어난 경우에만 걸린다. 설문 시작 화면으로 되돌린다.
  if (!question) {
    return <Redirect href="/survey" />;
  }

  return (
    <View className="flex-1 bg-default-bg">
      <View className="h-[70px]" />

      <View className="w-full items-center px-[30px]">
        <View className="w-full gap-[20px]">
          <SurveyProgressHeader
            current={currentNumber}
            total={SURVEY_TOTAL_QUESTIONS}
            onBackPress={handleBackPress}
          />

          <View className="w-full gap-[8px] px-[4px]">
            <Text variant="body-s" className="text-default-black">
              반죽 만들기 {formatQuestionNumber(currentNumber)}.
            </Text>
            <Text variant="heading-h2" className="text-default-black">
              {question.title}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-[240]" />

      <View className="w-full items-center px-[30px]">
        <View className="w-full gap-[20px]">
          {question.options.map((option, index) => (
            <SurveyOptionCard
              key={option.id}
              optionId={option.id}
              number={index + 1}
              label={option.label}
              onSelect={handleOptionSelect}
            />
          ))}
        </View>
      </View>

      <View className="flex-[49]" />

      <View className="w-full items-center">
        <BottomNav active="bread" />
      </View>

      <View className="h-[44px]" />
    </View>
  );
}
