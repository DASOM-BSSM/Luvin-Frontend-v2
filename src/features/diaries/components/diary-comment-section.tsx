import { useState } from 'react';
import { Pressable, View } from 'react-native';

import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import TextField from '@/src/components/ui/text-field';
import useCreateComment from '@/src/features/diaries/hooks/use-create-comment';
import useDiaryComments from '@/src/features/diaries/hooks/use-diary-comments';
import type { DiaryComment, DiaryId } from '@/src/features/diaries/types';
import { formatRelativeTime, UNKNOWN_AUTHOR_NAME } from '@/src/features/diaries/utils/feed';
import { toBreadType } from '@/src/features/survey/utils/map-bread-result';

interface DiaryCommentSectionProps {
  diaryId: DiaryId;
}

interface CommentItemProps {
  comment: DiaryComment;
  now: Date;
}

/**
 * 댓글 한 장(Figma 5950:6015) — 작성자 빵 · 닉네임 · 몇 분 전, 그 아래 내용. 빵 타입이 없으면
 * (설문 안 함 · 탈퇴) 일기 카드처럼 그림 자리를 비운다.
 */
const CommentItem = ({ comment, now }: CommentItemProps) => {
  const breadType = toBreadType(comment.authorBreadType);
  const authorName = comment.authorNickname ?? UNKNOWN_AUTHOR_NAME;

  return (
    <View className="w-full flex-col items-start gap-[8px] rounded-[8px] border border-default-gray bg-default-white p-[10px]">
      <View className="flex-row items-center gap-[4px]">
        {breadType ? (
          <BreadCharacter
            type={breadType}
            state="dough"
            className="h-[17px] w-[23px]"
            accessibilityLabel={authorName}
          />
        ) : null}
        <Text variant="body-xxs" className="text-center text-text-primary">
          {authorName}
        </Text>
        <Text variant="body-xxs" className="text-center text-text-muted">
          {formatRelativeTime(comment.createdAt, now)}
        </Text>
      </View>
      <Text variant="body-xs" className="w-full text-text-primary">
        {comment.content}
      </Text>
    </View>
  );
};

/** 일기 상세의 댓글 입력칸 + 목록. Figma 5950:6011 · 7055:4398. */
export default function DiaryCommentSection({ diaryId }: DiaryCommentSectionProps) {
  const [content, setContent] = useState('');
  const commentsQuery = useDiaryComments(diaryId);
  const createCommentMutation = useCreateComment();
  const now = new Date();

  function handleSendSuccess() {
    setContent('');
  }

  function handleSendPress() {
    const trimmed = content.trim();
    if (trimmed === '' || createCommentMutation.isPending) return;
    createCommentMutation.mutate({ diaryId, content: trimmed }, { onSuccess: handleSendSuccess });
  }

  function handleRetryPress() {
    commentsQuery.refetch();
  }

  return (
    <View className="w-full flex-col items-start gap-[8px]">
      <View className="w-full flex-row items-center gap-[4px]">
        <View className="flex-1">
          <TextField value={content} onChangeText={setContent} placeholder="댓글을 남겨주세요" />
        </View>
        <Button label="전송" variant="fieldAction" onPress={handleSendPress} />
      </View>
      {createCommentMutation.isError ? (
        <Text variant="body-xs" className="text-state-error">
          댓글을 남기지 못했어요. 다시 시도해 주세요
        </Text>
      ) : null}

      {commentsQuery.isLoading ? (
        <Text variant="body-xs" className="text-text-muted">
          불러오는 중...
        </Text>
      ) : commentsQuery.isError ? (
        <Pressable accessibilityRole="button" onPress={handleRetryPress}>
          <Text variant="body-xs" className="text-state-error">
            댓글을 불러오지 못했어요. 다시 시도
          </Text>
        </Pressable>
      ) : (
        (commentsQuery.data ?? []).map((comment) => (
          <CommentItem key={comment.id} comment={comment} now={now} />
        ))
      )}
    </View>
  );
}
