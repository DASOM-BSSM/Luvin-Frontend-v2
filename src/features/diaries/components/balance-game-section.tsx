import { Pressable, View } from 'react-native';

import SectionHeader from '@/src/components/ui/section-header';
import Text from '@/src/components/ui/text';
import BalanceGameCard from '@/src/features/diaries/components/balance-game-card';
import useAnswerDailyQuestion from '@/src/features/diaries/hooks/use-answer-daily-question';
import useTodayQuestion from '@/src/features/diaries/hooks/use-today-question';

const SECTION_TITLE = '오늘의 밸런스 게임';

/**
 * "오늘의 밸런스 게임" 섹션(Figma 6172:3344). `GET /api/daily_questions/today` 로 질문을 받고,
 * 보기를 누르면 바로 답을 보낸다.
 *
 * 로딩·에러·빈 상태는 Figma 시안이 없어서 다른 화면(bread/oven)과 같은 글자 안내로 둔다.
 * 투표 결과(`results`)도 보여줄 시안이 없어 아직 쓰지 않는다.
 */
export default function BalanceGameSection() {
  const todayQuery = useTodayQuestion();
  const answerMutation = useAnswerDailyQuestion();
  const today = todayQuery.data;

  function handleRetryPress() {
    todayQuery.refetch();
  }

  function handleOptionPress(optionId: number) {
    if (!today) return;
    answerMutation.mutate({ questionId: today.questionId, optionId });
  }

  if (todayQuery.isLoading) {
    return (
      <View className="w-full flex-col items-start gap-[12px]">
        <SectionHeader title={SECTION_TITLE} />
        <Text variant="body-s" className="text-text-muted">
          불러오는 중...
        </Text>
      </View>
    );
  }

  if (todayQuery.isError) {
    return (
      <View className="w-full flex-col items-start gap-[12px]">
        <SectionHeader title={SECTION_TITLE} />
        <Pressable accessibilityRole="button" onPress={handleRetryPress}>
          <Text variant="body-s" className="text-state-error">
            오늘의 질문을 불러오지 못했어요. 다시 시도
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!today || today.options.length === 0) {
    return (
      <View className="w-full flex-col items-start gap-[12px]">
        <SectionHeader title={SECTION_TITLE} />
        <Text variant="body-s" className="text-text-muted">
          오늘의 질문이 아직 없어요
        </Text>
      </View>
    );
  }

  // 답을 보내는 동안에는 방금 누른 보기를 먼저 고른 것으로 보여준다.
  const selectedOptionId = answerMutation.isPending
    ? answerMutation.variables.optionId
    : (today.selectedOptionId ?? undefined);

  return (
    <View className="w-full flex-col items-start gap-[12px]">
      <SectionHeader title={SECTION_TITLE} actionLabel={`${today.totalCount}명 응답중`} />
      <BalanceGameCard
        question={today.question}
        options={today.options}
        selectedOptionId={selectedOptionId}
        disabled={today.answered || answerMutation.isPending}
        onOptionPress={handleOptionPress}
      />
      {answerMutation.isError ? (
        <Text variant="body-xs" className="w-full text-center text-state-error">
          답을 보내지 못했어요. 다시 눌러 주세요
        </Text>
      ) : null}
    </View>
  );
}
