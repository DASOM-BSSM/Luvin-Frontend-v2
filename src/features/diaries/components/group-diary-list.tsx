import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import Text from '@/src/components/ui/text';
import MyDiaryPromptCard from '@/src/features/diaries/components/my-diary-prompt-card';
import ReactableDiaryCard from '@/src/features/diaries/components/reactable-diary-card';
import useMyDiaryAuthor from '@/src/features/diaries/hooks/use-my-diary-author';
import useRoomDiaries from '@/src/features/diaries/hooks/use-room-diaries';
import type { DiaryFeedItem, RoomId } from '@/src/features/diaries/types';
import {
  formatHourSlot,
  getCooldownSeconds,
  getLastWrittenAt,
} from '@/src/features/diaries/utils/feed';
import { filterSlotDiaries } from '@/src/features/diaries/utils/hour-slot';

interface GroupDiaryListProps {
  roomId: RoomId;
  /** 보여줄 시간대(정각 칸, "2026-11-02T09"). 이 칸에 쓴 일기만 보인다. */
  slot: string;
  /** 지금 시각의 칸을 볼 때만 "눌러서 작성" 카드를 둔다 — 지난 칸에는 새로 쓸 수 없다. */
  canWrite: boolean;
  onWritePress: () => void;
  /** 일기 카드를 누르면 상세(반응 · 댓글)를 연다. */
  onDiaryPress: (diary: DiaryFeedItem) => void;
  /** 내 일기 카드의 더보기(⋮) — 상세를 삭제 · 수정 메뉴가 펼쳐진 채로 연다. */
  onDiaryMorePress: (diary: DiaryFeedItem) => void;
}

interface DiaryItemProps {
  diary: DiaryFeedItem;
  onPress: (diary: DiaryFeedItem) => void;
  onMorePress: (diary: DiaryFeedItem) => void;
}

/** 카드를 누르면 상세, 반응 버튼(☺+)을 누르면 카드 안에서 바로 이모지 고르기가 펼쳐진다. */
const DiaryItem = ({ diary, onPress, onMorePress }: DiaryItemProps) => {
  function handlePress() {
    onPress(diary);
  }

  function handleMorePress() {
    onMorePress(diary);
  }

  return (
    <Pressable accessibilityRole="button" className="w-full" onPress={handlePress}>
      <ReactableDiaryCard diary={diary} onMorePress={diary.isMine ? handleMorePress : undefined} />
    </Pressable>
  );
};

/**
 * 감정일기 메인의 일기 목록(Figma 5950:5841). `GET /api/diary-rooms/{roomId}/diaries` 를 받아
 * 그룹 일기 카드로 그린다. 맨 위의 "눌러서 작성" 카드는 지금 쓸 수 있을 때만 둔다 — 일기는
 * 1시간에 한 번씩 쓸 수 있어서(기획), 내가 쓰면 사라졌다가 1시간이 지나면 다시 나온다(LUV-90 피드백).
 * 지금은 정각 칸마다 한 번이다 — 이 칸에 썼으면 다음 정각에 다시 나온다(utils/feed.ts `getCooldownSeconds`).
 *
 * 일기는 고른 정각 칸에 쓴 것만 보여준다 — 다른 시간 · 다른 날짜 일기는 같은 화면에 두지 않는다(사용자 결정).
 * 칸은 `GroupSlotBody` 가 정한다(utils/hour-slot.ts).
 *
 * 로딩 · 에러 상태는 시안이 없어 다른 화면과 같은 글자 안내로 둔다.
 */
export default function GroupDiaryList({
  roomId,
  slot,
  canWrite,
  onWritePress, onDiaryPress, onDiaryMorePress }: GroupDiaryListProps) {
  const diariesQuery = useRoomDiaries(roomId);
  const me = useMyDiaryAuthor();
  const [tickedAt, setTickedAt] = useState(Date.now);
  // 화면을 오래 켜 둔 채 새 일기를 쓰면 tickedAt 이 옛 시각이라, 목록을 받은 시각까지 당겨 쓴다.
  const now = Math.max(tickedAt, diariesQuery.dataUpdatedAt);
  const cooldownSeconds = getCooldownSeconds(getLastWrittenAt(diariesQuery.data ?? []), now);

  // 다시 쓸 수 있게 되는 순간 "눌러서 작성" 카드를 다시 그린다.
  useEffect(() => {
    if (cooldownSeconds === 0) return;
    const timer = setTimeout(() => setTickedAt(Date.now()), cooldownSeconds * 1000);
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

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

  const diaries = filterSlotDiaries(diariesQuery.data ?? [], slot);

  return (
    <View className="w-full flex-col items-start gap-[20px]">
      {canWrite && cooldownSeconds === 0 ? (
        <MyDiaryPromptCard author={me} time={formatHourSlot(new Date(now))} onWritePress={onWritePress} />
      ) : null}
      {diaries.map((diary) => (
        <DiaryItem key={diary.diaryId} diary={diary} onPress={onDiaryPress} onMorePress={onDiaryMorePress} />
      ))}
    </View>
  );
}
