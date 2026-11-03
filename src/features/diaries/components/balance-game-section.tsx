import { Pressable, View } from 'react-native';

import SectionHeader from '@/src/components/ui/section-header';
import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import BalanceGameCard from '@/src/features/diaries/components/balance-game-card';
import useAnswerBalanceGame from '@/src/features/diaries/hooks/use-answer-balance-game';
import useTodayBalanceGame from '@/src/features/diaries/hooks/use-today-balance-game';
import { getAnswerBalanceGameErrorMessage } from '@/src/features/diaries/utils/errors';

const SECTION_TITLE = '오늘의 밸런스 게임';

/** 밸런스 게임은 두 보기 중 하나를 고른다(리뷰 LUV-83) — 서버가 더 보내도 앞의 두 개만 쓴다. */
const BALANCE_OPTION_COUNT = 2;

/**
 * "오늘의 밸런스 게임" 섹션(Figma 6172:3344). `GET /api/daily_questions/today` 로 질문을 받고,
 * 보기를 누르면 바로 답을 보낸다. 답은 한 번뿐이라 고른 뒤에는 버튼을 막는다.
 *
 * 오늘 질문이 없으면(서버 `data: null`) 서버 안내대로 섹션을 통째로 숨긴다.
 * 로딩·에러 상태는 Figma 시안이 없어서 다른 화면(bread/oven)과 같은 글자 안내로 둔다.
 * 투표 결과(`results`)는 보여줄 시안이 없어 아직 쓰지 않는다. 응답 수(`totalCount`)는 고른 뒤에만
 * 서버가 채워 주므로(고르기 전엔 0) "N명 응답중"도 고른 뒤에만 보여준다.
 */
export default function BalanceGameSection() {
  const todayQuery = useTodayBalanceGame();
  const answerMutation = useAnswerBalanceGame();
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
            {ERROR_MESSAGES.balanceGameFailed}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!today || today.options.length === 0) {
    return null;
  }

  // 답을 보내는 동안에는 방금 누른 보기를 먼저 고른 것으로 보여준다.
  const selectedOptionId = answerMutation.isPending
    ? answerMutation.variables.optionId
    : (today.selectedOptionId ?? undefined);

  return (
    <View className="w-full flex-col items-start gap-[12px]">
      <SectionHeader
        title={SECTION_TITLE}
        actionLabel={today.answered ? `${today.totalCount}명 응답중` : undefined}
      />
      <BalanceGameCard
        question={today.question}
        options={today.options.slice(0, BALANCE_OPTION_COUNT)}
        selectedOptionId={selectedOptionId}
        disabled={today.answered || answerMutation.isPending}
        onOptionPress={handleOptionPress}
      />
      {answerMutation.isError ? (
        <Text variant="body-xs" className="w-full text-center text-state-error">
          {getAnswerBalanceGameErrorMessage(answerMutation.error)}
        </Text>
      ) : null}
    </View>
  );
}
