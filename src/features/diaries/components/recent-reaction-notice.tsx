import { Pressable } from 'react-native';

import Text from '@/src/components/ui/text';
import useMyDiaryAuthor from '@/src/features/diaries/hooks/use-my-diary-author';
import type { DiaryRecentReaction, RoomId } from '@/src/features/diaries/types';
import { resolveAuthorName, toDisplayEmoji, UNKNOWN_BREAD_NAME } from '@/src/features/diaries/utils/feed';
import useMyProfile from '@/src/features/user/hooks/use-my-profile';

interface RecentReactionNoticeProps {
  reaction: DiaryRecentReaction;
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
 * 글자 크기는 질문 생성 알림과 같은 Body/S 14px 로 맞췄다(사용자 결정, Figma 는 Body/XS 12px).
 * 반응이 없을 때 무엇을 대신 보여줄지는 `GroupFeedNotice` 가 정한다.
 */
export default function RecentReactionNotice({ reaction, onPress }: RecentReactionNoticeProps) {
  const me = useMyDiaryAuthor();
  const myId = useMyProfile().data?.memberId;

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
    onPress(reaction.roomId);
  }

  return (
    <Pressable
      accessibilityRole="button"
      className="w-full rounded-[8px] border border-default-gray px-[16px] py-[12px]"
      onPress={handlePress}
    >
      <Text variant="body-s" className="text-text-primary">
        {`${reactorName}님이 ${authorName}님의 일기에 '${toDisplayEmoji(reaction.emoji)}' 반응을 했습니다.`}
      </Text>
    </Pressable>
  );
}
