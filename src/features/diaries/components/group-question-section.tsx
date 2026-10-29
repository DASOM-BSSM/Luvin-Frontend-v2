import { useState } from 'react';
import { Pressable, View } from 'react-native';

import Skeleton from '@/src/components/ui/skeleton';
import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import QuestionAnswersModal from '@/src/features/diaries/components/question-answers-modal';
import QuestionEmptyCard from '@/src/features/diaries/components/question-empty-card';
import QuestionPrompt from '@/src/features/diaries/components/question-prompt';
import QuestionStatusCard from '@/src/features/diaries/components/question-status-card';
import useCreateQuestion from '@/src/features/diaries/hooks/use-create-question';
import useCurrentQuestion from '@/src/features/diaries/hooks/use-current-question';
import type { RoomId } from '@/src/features/diaries/types';
import { isTodayQuestion } from '@/src/features/diaries/utils/question';

interface GroupQuestionSectionProps {
  roomId: RoomId;
}

/**
 * 감정일기 메인의 그룹 질문 자리. 지금 질문(`GET .../questions/current`) 상태에 따라:
 * - 불러오는 중: 카드 자리 스켈레톤 / 실패: 다시 시도
 * - 오늘 질문 없음(한 번도 없거나 지난 날짜 것뿐): "질문 생성하기" 카드(6271:6645)
 * - generating: 만드는 중 카드 — `useCurrentQuestion` 이 ready 가 될 때까지 다시 부른다
 * - failed: 다시 만들기 카드
 * - ready: "Q. ..." 문장(5942:5456) — 누르면 답 모달
 *
 * 지난 날짜 질문만 있으면 만들기 카드 아래 "지난 질문 보기"로 그 질문의 모달(답 · 지난 질문 목록)을 연다.
 */
export default function GroupQuestionSection({ roomId }: GroupQuestionSectionProps) {
  const questionQuery = useCurrentQuestion(roomId);
  const createMutation = useCreateQuestion(roomId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const question = questionQuery.data;

  // 진행 중에는 다시 보내지 않는다. 버튼 비활성 모양은 폭을 꽉 채우는 회색 막대라 쓰지 않는다.
  function handleCreatePress() {
    if (createMutation.isPending) return;
    createMutation.mutate();
  }

  function handleRetryPress() {
    questionQuery.refetch();
  }

  function handleOpenPress() {
    setIsModalOpen(true);
  }

  function handleModalClose() {
    setIsModalOpen(false);
  }

  function renderBody() {
    if (questionQuery.isLoading) {
      return <Skeleton className="h-[96px] w-full rounded-[8px]" />;
    }
    if (questionQuery.isError) {
      return (
        <Pressable accessibilityRole="button" onPress={handleRetryPress}>
          <Text variant="body-s" className="text-state-error">
            질문을 불러오지 못했어요. 다시 시도
          </Text>
        </Pressable>
      );
    }
    if (!question || !isTodayQuestion(question, new Date())) {
      return (
        <View className="w-full flex-col items-center gap-[8px]">
          <QuestionEmptyCard onCreatePress={handleCreatePress} />
          {question?.status === 'ready' ? (
            <Pressable accessibilityRole="button" onPress={handleOpenPress}>
              <Text variant="body-xs" className="text-text-muted">
                지난 질문 보기
              </Text>
            </Pressable>
          ) : null}
        </View>
      );
    }
    if (question.status === 'generating') {
      return <QuestionStatusCard message="질문을 만들고 있어요..." />;
    }
    if (question.status === 'failed') {
      return (
        <QuestionStatusCard
          message={ERROR_MESSAGES.createQuestionFailed}
          actionLabel="다시 만들기"
          onActionPress={handleCreatePress}
        />
      );
    }
    return <QuestionPrompt question={question} onOpenPress={handleOpenPress} />;
  }

  return (
    <View className="w-full flex-col items-center gap-[8px]">
      {renderBody()}
      {createMutation.isError ? (
        <Text variant="body-xs" className="text-state-error">
          {ERROR_MESSAGES.createQuestionFailed}
        </Text>
      ) : null}
      <QuestionAnswersModal
        question={isModalOpen && question?.status === 'ready' ? question : undefined}
        onClose={handleModalClose}
      />
    </View>
  );
}
