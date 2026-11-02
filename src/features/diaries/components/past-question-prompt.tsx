import { useState } from 'react';
import { Pressable, View } from 'react-native';

import Text from '@/src/components/ui/text';
import QuestionAnswersModal from '@/src/features/diaries/components/question-answers-modal';
import useRoomQuestion from '@/src/features/diaries/hooks/use-room-question';
import type { RoomId, RoomQuestionHistoryItem } from '@/src/features/diaries/types';

interface PastQuestionPromptProps {
  roomId: RoomId;
  /** 지난 칸의 질문(목록 한 줄 — 문장만 있고 답은 없다). */
  item: RoomQuestionHistoryItem;
}

/**
 * 지난 시간대의 질문 문장. 지금 질문(`QuestionPrompt`)과 같은 "Q. ..." 모양이다.
 *
 * 누르면 질문 상세(`GET .../questions/{questionId}`)를 받아 지금 질문과 같은 답 모달을 연다 — 지난 질문에도
 * 답을 남길 수 있다(서버 규칙). 받는 동안 · 실패하면 문장 아래 글자로 알린다(시안 없음).
 */
export default function PastQuestionPrompt({ roomId, item }: PastQuestionPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const questionQuery = useRoomQuestion(roomId, isOpen ? item.questionId : undefined);
  const question = isOpen && questionQuery.data?.status === 'ready' ? questionQuery.data : undefined;

  function handlePress() {
    setIsOpen(true);
  }

  function handleRetryPress() {
    questionQuery.refetch();
  }

  function handleModalClose() {
    setIsOpen(false);
  }

  return (
    <View className="w-full flex-col items-center gap-[8px]">
      <Pressable accessibilityRole="button" className="w-full" onPress={handlePress}>
        <Text variant="heading-h4" className="w-full text-text-primary">
          Q. {item.content}
        </Text>
      </Pressable>
      {isOpen && questionQuery.isLoading ? (
        <Text variant="body-xs" className="text-text-muted">
          불러오는 중...
        </Text>
      ) : null}
      {isOpen && questionQuery.isError ? (
        <Pressable accessibilityRole="button" onPress={handleRetryPress}>
          <Text variant="body-xs" className="text-state-error">
            질문을 불러오지 못했어요. 다시 시도
          </Text>
        </Pressable>
      ) : null}
      <QuestionAnswersModal question={question} onClose={handleModalClose} />
    </View>
  );
}
