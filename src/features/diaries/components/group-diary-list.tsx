import { Pressable, View } from 'react-native';

import Text from '@/src/components/ui/text';
import GroupDiaryCard from '@/src/features/diaries/components/group-diary-card';
import MyDiaryPromptCard from '@/src/features/diaries/components/my-diary-prompt-card';
import useMyDiaryAuthor from '@/src/features/diaries/hooks/use-my-diary-author';
import useRoomDiaries from '@/src/features/diaries/hooks/use-room-diaries';
import type { DiaryFeedItem, RoomId } from '@/src/features/diaries/types';
import { formatHourSlot, toGroupDiaryPreview } from '@/src/features/diaries/utils/feed';

interface GroupDiaryListProps {
  roomId: RoomId;
  onWritePress: () => void;
  /** 일기 카드를 누르면 상세(반응 · 댓글)를 연다. */
  onDiaryPress: (diary: DiaryFeedItem) => void;
}

interface DiaryItemProps {
  diary: DiaryFeedItem;
  onPress: (diary: DiaryFeedItem) => void;
}

const DiaryItem = ({ diary, onPress }: DiaryItemProps) => {
  function handlePress() {
    onPress(diary);
  }

  return (
    <Pressable accessibilityRole="button" className="w-full" onPress={handlePress}>
      <GroupDiaryCard diary={toGroupDiaryPreview(diary)} />
    </Pressable>
  );
};

/**
 * 감정일기 메인의 일기 목록(Figma 5950:5841). `GET /api/diary-rooms/{roomId}/diaries` 를 받아
 * 그룹 일기 카드로 그린다. 맨 위에는 항상 "눌러서 작성" 카드를 둔다 — 일기는 1시간에 한 번씩
 * 쓸 수 있어서(기획), 남은 시간은 일기 올리기 모달의 버튼이 보여준다.
 *
 * 로딩 · 에러 상태는 시안이 없어 다른 화면과 같은 글자 안내로 둔다.
 */
export default function GroupDiaryList({ roomId, onWritePress, onDiaryPress }: GroupDiaryListProps) {
  const diariesQuery = useRoomDiaries(roomId);
  const me = useMyDiaryAuthor();
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

  return (
    <View className="w-full flex-col items-start gap-[20px]">
      <MyDiaryPromptCard author={me} time={formatHourSlot(now)} onWritePress={onWritePress} />
      {diaries.map((diary) => (
        <DiaryItem key={diary.diaryId} diary={diary} onPress={onDiaryPress} />
      ))}
    </View>
  );
}
