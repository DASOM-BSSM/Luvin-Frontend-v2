import { Pressable } from 'react-native';

import Text from '@/src/components/ui/text';
import useMyDiaryAuthor from '@/src/features/diaries/hooks/use-my-diary-author';
import useRecentReaction from '@/src/features/diaries/hooks/use-recent-reaction';
import type { RoomId } from '@/src/features/diaries/types';
import { resolveAuthorName, toDisplayEmoji, UNKNOWN_BREAD_NAME } from '@/src/features/diaries/utils/feed';
import useMyProfile from '@/src/features/user/hooks/use-my-profile';

interface RecentReactionNoticeProps {
  /** 카드를 누르면 그 일기가 있는 그룹으로 간다. */
  onPress: (roomId: RoomId) => void;
}

/**
 * "쫀쫀한 조합들" 맨 위 반응 알림. Figma "감정일기 홈"(5950:6585)의 5950:6776 — "쫀쫀한 카스테라님이 쫀쫀한
 * 소금빵님의 일기에 '❤️' 반응을 했습니다." 한 문장. 시안에는 문장 앞에 반죽 그림이 있지만 질문 생성 알림처럼
 * 문구만 둔다(사용자 결정).
 * 서버(`GET /api/diaries/reactions/recent`)가 가장 최근 반응 하나를 준다 — 내가 남긴 반응은 빠진다.
 * 안쪽 여백은 질문 생성 알림과 같은 위아래 12 · 양옆 16(사용자 지정)으로 맞췄다(Figma 는 사방 12).
 *
 * 알림은 덤이라 반응이 없거나 · 불러오는 중이거나 · 실패하면 아무것도 그리지 않는다.
 */
export default function RecentReactionNotice({ onPress }: RecentReactionNoticeProps) {
  const reactionQuery = useRecentReaction();
  const me = useMyDiaryAuthor();
  const myId = useMyProfile().data?.memberId;
  const reaction = reactionQuery.data;

  if (!reaction) return null;

  const reactorName = resolveAuthorName(
    {
      isMine: false,
      nickname: reaction.reactorBreadName ?? '',
      breadName: reaction.reactorBreadName,
      breadType: reaction.reactorBreadType,
    },
    me.name,
  );
  const authorName =
    myId !== undefined && reaction.diaryAuthorId === myId
      ? me.name
      : (reaction.diaryAuthorBreadName ?? UNKNOWN_BREAD_NAME);

  function handlePress() {
    if (reaction) onPress(reaction.roomId);
  }

  return (
    <Pressable
      accessibilityRole="button"
      className="w-full rounded-[8px] border border-default-gray px-[16px] py-[12px]"
      onPress={handlePress}
    >
      <Text variant="body-xs" className="text-text-primary">
        {`${reactorName}님이 ${authorName}님의 일기에 '${toDisplayEmoji(reaction.emoji)}' 반응을 했습니다.`}
      </Text>
    </Pressable>
  );
}
