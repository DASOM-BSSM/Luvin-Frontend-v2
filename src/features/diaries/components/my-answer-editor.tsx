import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import TextField from '@/src/components/ui/text-field';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import QuestionAnswerItem from '@/src/features/diaries/components/question-answer-item';
import useAnswerQuestion from '@/src/features/diaries/hooks/use-answer-question';
import useDeleteAnswer from '@/src/features/diaries/hooks/use-delete-answer';
import type { RoomQuestion } from '@/src/features/diaries/types';
import { getAnswerQuestionErrorMessage } from '@/src/features/diaries/utils/errors';
import { ANSWER_MAX_LENGTH, isValidAnswer } from '@/src/features/diaries/utils/question';

interface MyAnswerEditorProps {
  question: RoomQuestion;
  now: Date;
}

/**
 * 그룹 질문의 내 답 — 아직 없거나 고치는 중이면 입력칸, 있으면 내 답 카드(수정 · 삭제).
 *
 * [DRAFT] Figma 에 답 쓰기 시안이 없어 일기 상세의 댓글 입력칸(5950:6011)과 같은 모양으로 그렸다.
 * 삭제는 되돌릴 수 없어 `Alert.alert` 로 한 번 묻는다(§11 의 파괴적 동작 확인 예외).
 */
export default function MyAnswerEditor({ question, now }: MyAnswerEditorProps) {
  const { roomId, questionId, myAnswer } = question;
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const answerMutation = useAnswerQuestion();
  const deleteMutation = useDeleteAnswer();
  const isPending = answerMutation.isPending || deleteMutation.isPending;

  function handleSaveSuccess() {
    setContent('');
    setIsEditing(false);
  }

  function handleSavePress() {
    if (!isValidAnswer(content) || isPending) return;
    answerMutation.mutate({ roomId, questionId, content: content.trim() }, { onSuccess: handleSaveSuccess });
  }

  function handleEditPress() {
    setContent(myAnswer?.content ?? '');
    setIsEditing(true);
  }

  function handleCancelPress() {
    setContent('');
    setIsEditing(false);
    answerMutation.reset();
  }

  function handleDeleteConfirm() {
    deleteMutation.mutate({ roomId, questionId });
  }

  function handleDeletePress() {
    Alert.alert('답 삭제', '내 답을 지울까요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: handleDeleteConfirm },
    ]);
  }

  if (myAnswer && !isEditing) {
    return (
      <View className="w-full flex-col items-start gap-[4px]">
        <QuestionAnswerItem
          answer={myAnswer}
          now={now}
          onEditPress={handleEditPress}
          onDeletePress={handleDeletePress}
          actionsDisabled={isPending}
        />
        {deleteMutation.isError ? (
          <Text variant="body-xs" className="text-state-error">
            {ERROR_MESSAGES.deleteAnswerFailed}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className="w-full flex-col items-start gap-[4px]">
      <View className="w-full flex-row items-center gap-[4px]">
        <View className="flex-1">
          <TextField
            value={content}
            onChangeText={setContent}
            placeholder="질문에 답을 남겨주세요"
            maxLength={ANSWER_MAX_LENGTH}
            accessibilityLabel="내 답"
          />
        </View>
        {/* 비활성(disabled) 모양은 폭을 꽉 채우는 회색 막대라 쓰지 않고, 빈 답 · 진행 중은 핸들러에서 막는다(댓글 입력칸과 같음). */}
        <Button label={isEditing ? '수정' : '등록'} variant="fieldAction" onPress={handleSavePress} />
        {/* 취소는 답 카드의 수정 · 삭제처럼 글자 버튼으로 — outline 버튼은 옆 버튼보다 커서 어색했다. */}
        {isEditing ? (
          <Pressable accessibilityRole="button" className="px-[4px]" onPress={handleCancelPress}>
            <Text variant="body-xs" className="text-text-muted">
              취소
            </Text>
          </Pressable>
        ) : null}
      </View>
      {answerMutation.isError ? (
        <Text variant="body-xs" className="text-state-error">
          {getAnswerQuestionErrorMessage(answerMutation.error)}
        </Text>
      ) : null}
    </View>
  );
}
