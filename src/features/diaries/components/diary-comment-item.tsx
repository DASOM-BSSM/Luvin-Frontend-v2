import { View } from 'react-native';

import BreadCharacter from '@/src/assets/images/BreadCharacter';
import ExpandableText from '@/src/components/ui/expandable-text';
import Text from '@/src/components/ui/text';
import type { DiaryComment } from '@/src/features/diaries/types';
import { COMMENT_MAX_LINES } from '@/src/features/diaries/utils/comment';
import { formatRelativeTime, resolveAuthorName } from '@/src/features/diaries/utils/feed';
import { toBreadType } from '@/src/features/survey/utils/map-bread-result';

interface DiaryCommentItemProps {
  comment: DiaryComment;
  now: Date;
  /** 내 빵 이름 — 내 댓글이면 이 이름을 쓴다. */
  myName: string;
  /** 이 그룹에서 정한 작성자 닉네임(LUV-121). 없으면 null. */
  groupNickname: string | null;
}

/**
 * 댓글 한 장(Figma 5950:6015) — 작성자 빵 · 닉네임 · 몇 분 전, 그 아래 내용. 빵 타입이 없으면
 * (설문 안 함 · 탈퇴) 일기 카드처럼 그림 자리를 비운다.
 * 내용이 `COMMENT_MAX_LINES` 줄을 넘으면 접고 "더보기"로 펼친다 — 긴 댓글에 카드가 끝없이 늘어나지 않게.
 */
export default function DiaryCommentItem({
  comment,
  now,
  myName,
  groupNickname,
}: DiaryCommentItemProps) {
  const breadType = toBreadType(comment.authorBreadType);
  // 실제 이름이 아니라 빵 이름으로 쓴다(사용자 결정, utils/feed.ts `resolveAuthorName`). 그룹 닉네임이 있으면 그걸 쓴다(LUV-121).
  const authorName = resolveAuthorName(
    {
      isMine: comment.isMine,
      nickname: comment.authorNickname,
      breadName: comment.authorBreadName,
      breadType: comment.authorBreadType,
      groupNickname,
    },
    myName,
  );

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
      <ExpandableText variant="body-xs" className="w-full text-text-primary" maxLines={COMMENT_MAX_LINES}>
        {comment.content}
      </ExpandableText>
    </View>
  );
}
