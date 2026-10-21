import { Pressable, View } from 'react-native';

import Text from '@/src/components/ui/text';
import useBreadProfile from '@/src/features/bread/hooks/use-bread-profile';
import GroupDiaryCard from '@/src/features/diaries/components/group-diary-card';
import MyDiaryPromptCard from '@/src/features/diaries/components/my-diary-prompt-card';
import useRoomDiaries from '@/src/features/diaries/hooks/use-room-diaries';
import type { GroupDiaryAuthor, RoomId } from '@/src/features/diaries/types';
import {
  UNKNOWN_AUTHOR_NAME,
  formatClockTime,
  isWrittenOn,
  toGroupDiaryPreview,
} from '@/src/features/diaries/utils/feed';
import useMyProfile from '@/src/features/user/hooks/use-my-profile';

interface GroupDiaryListProps {
  roomId: RoomId;
  onWritePress: () => void;
}

/**
 * 감정일기 메인의 일기 목록(Figma 5950:5841). `GET /api/diary-rooms/{roomId}/diaries` 를 받아
 * 그룹 일기 카드로 그린다. 오늘 내가 아직 안 썼으면 맨 위에 "눌러서 작성" 카드를 둔다.
 *
 * 로딩 · 에러 상태는 시안이 없어 다른 화면과 같은 글자 안내로 둔다.
 */
export default function GroupDiaryList({ roomId, onWritePress }: GroupDiaryListProps) {
  const diariesQuery = useRoomDiaries(roomId);
  const { profile } = useBreadProfile();
  const myProfileQuery = useMyProfile();
  const now = new Date();

  function handleRetryPress() {
    diariesQuery.refetch();
  }

  if (diariesQuery.isLoading) {
    return (
      <Text variant="body-s" className="text-text-muted">
        불러오는 중...
      </Text>
    );
  }

  if (diariesQuery.isError) {
    return (
      <Pressable accessibilityRole="button" onPress={handleRetryPress}>
        <Text variant="body-s" className="text-state-error">
          일기를 불러오지 못했어요. 다시 시도
        </Text>
      </Pressable>
    );
  }

  const diaries = diariesQuery.data ?? [];
  const hasWrittenToday = diaries.some((diary) => diary.isMine && isWrittenOn(diary.createdAt, now));
  const me: GroupDiaryAuthor = {
    type: profile?.type ?? null,
    state: 'dough',
    name: myProfileQuery.data?.nickname ?? profile?.name ?? UNKNOWN_AUTHOR_NAME,
  };

  return (
    <View className="w-full flex-col items-start gap-[20px]">
      {hasWrittenToday ? null : (
        <MyDiaryPromptCard author={me} time={formatClockTime(now)} onWritePress={onWritePress} />
      )}
      {diaries.map((diary) => (
        <GroupDiaryCard key={diary.diaryId} diary={toGroupDiaryPreview(diary)} />
      ))}
    </View>
  );
}
