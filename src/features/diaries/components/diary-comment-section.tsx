import { useState } from 'react';
import { Pressable, View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import TextField from '@/src/components/ui/text-field';
import DiaryCommentItem from '@/src/features/diaries/components/diary-comment-item';
import useCreateComment from '@/src/features/diaries/hooks/use-create-comment';
import useDiaryComments from '@/src/features/diaries/hooks/use-diary-comments';
import useMyDiaryAuthor from '@/src/features/diaries/hooks/use-my-diary-author';
import type { DiaryId } from '@/src/features/diaries/types';
import { COMMENT_MAX_LENGTH, selectVisibleComments } from '@/src/features/diaries/utils/comment';

interface DiaryCommentSectionProps {
  diaryId: DiaryId;
}

/**
 * 일기 상세의 댓글 입력칸 + 목록. Figma 5950:6011 · 7055:4398.
 * 댓글은 `COMMENT_MAX_LENGTH` 자까지 쓸 수 있고, 목록은 최근 `VISIBLE_COMMENT_COUNT` 개만 보여준 뒤
 * "이전 댓글 N개 더보기"로 펼친다(사용자 결정) — 댓글이 많아도 상세가 끝없이 늘어나지 않게.
 */
export default function DiaryCommentSection({ diaryId }: DiaryCommentSectionProps) {
  const [content, setContent] = useState('');
  const [isAllCommentsShown, setIsAllCommentsShown] = useState(false);
  const commentsQuery = useDiaryComments(diaryId);
  const { visible: visibleComments, hiddenCount } = selectVisibleComments(
    commentsQuery.data ?? [],
    isAllCommentsShown,
  );
  const createCommentMutation = useCreateComment();
  const me = useMyDiaryAuthor();
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

  function handleShowAllPress() {
    setIsAllCommentsShown(true);
  }

  return (
    <View className="w-full flex-col items-start gap-[8px]">
      <View className="w-full flex-row items-center gap-[4px]">
        <View className="flex-1">
          <TextField
            value={content}
            onChangeText={setContent}
            placeholder="댓글을 남겨주세요"
            maxLength={COMMENT_MAX_LENGTH}
          />
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
        <>
          {hiddenCount > 0 ? (
            <Pressable accessibilityRole="button" hitSlop={8} onPress={handleShowAllPress}>
              <Text variant="body-xxs" className="text-text-muted">
                이전 댓글 {hiddenCount}개 더보기
              </Text>
            </Pressable>
          ) : null}
          {visibleComments.map((comment) => (
            <DiaryCommentItem key={comment.id} comment={comment} now={now} myName={me.name} />
          ))}
        </>
      )}
    </View>
  );
}
