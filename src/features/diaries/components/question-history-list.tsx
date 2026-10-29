import { Pressable, View } from 'react-native';

import Skeleton from '@/src/components/ui/skeleton';
import Text from '@/src/components/ui/text';
import useQuestionHistory from '@/src/features/diaries/hooks/use-question-history';
import type { RoomId, RoomQuestion } from '@/src/features/diaries/types';
import { formatQuestionDate, getPastQuestions } from '@/src/features/diaries/utils/question';

interface QuestionHistoryListProps {
  roomId: RoomId;
  /** 위에 따로 보이는 질문 — 목록에서는 뺀다. */
  current: RoomQuestion;
}

/**
 * 지난 그룹 질문 목록(날짜 · 질문 · 답 수). 서버가 지난 질문은 답 내용 없이 답 수만 줘서 읽기만 한다.
 *
 * [DRAFT] Figma 에 시안이 없어 일기 상세의 카드 모양(흰 바탕 · 회색 테두리)으로 그렸다.
 */
export default function QuestionHistoryList({ roomId, current }: QuestionHistoryListProps) {
  const historyQuery = useQuestionHistory(roomId, true);
  const pastQuestions = getPastQuestions(historyQuery.data ?? [], current);

  function handleRetryPress() {
    historyQuery.refetch();
  }

  return (
    <View className="w-full flex-col items-start gap-[8px]">
      <Text variant="body-s" className="text-text-primary">
        지난 질문
      </Text>
      {historyQuery.isLoading ? (
        <>
          <Skeleton className="h-[64px] w-full rounded-[8px]" />
          <Skeleton className="h-[64px] w-full rounded-[8px]" />
        </>
      ) : historyQuery.isError ? (
        <Pressable accessibilityRole="button" onPress={handleRetryPress}>
          <Text variant="body-xs" className="text-state-error">
            지난 질문을 불러오지 못했어요. 다시 시도
          </Text>
        </Pressable>
      ) : pastQuestions.length === 0 ? (
        <Text variant="body-xs" className="text-text-primary">
          아직 지난 질문이 없어요
        </Text>
      ) : (
        pastQuestions.map((item) => (
          <View
            key={item.questionId}
            className="w-full flex-col items-start gap-[4px] rounded-[8px] border border-default-gray bg-default-white p-[10px]"
          >
            <Text variant="body-xxs" className="text-text-muted">
              {formatQuestionDate(item.questionDate)} · 답 {item.answerCount}개
            </Text>
            <Text variant="body-xs" className="w-full text-text-primary">
              Q. {item.content}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}
