import { useState } from 'react';
import { Pressable } from 'react-native';

import ChevronDownIcon from '@/src/assets/icons/ChevronDownIcon';
import Text from '@/src/components/ui/text';
import GroupSwitcherSheet from '@/src/features/diaries/components/group-switcher-sheet';
import useMyRooms from '@/src/features/diaries/hooks/use-my-rooms';
import type { RoomId } from '@/src/features/diaries/types';

interface GroupSwitchTitleProps {
  /** 그룹 이름(또는 아직 모를 때 대신 쓰는 제목). */
  title: string;
  /** 지금 보고 있는 그룹. */
  roomId?: RoomId;
  /** 다른 그룹을 고르면. 같은 그룹을 다시 누르면 시트만 닫힌다. */
  onRoomSelect: (roomId: RoomId) => void;
}

/**
 * 그룹 이름 제목. 내 그룹이 둘 이상이면 이름 옆에 아래 꺾쇠가 붙고, 누르면 내 그룹 목록 시트가 떠서 다른
 * 그룹으로 바꾼다(여러 그룹 참여). 그룹이 하나뿐이면 바꿀 곳이 없어 그냥 글자다.
 */
export default function GroupSwitchTitle({ title, roomId, onRoomSelect }: GroupSwitchTitleProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const roomCount = useMyRooms().data?.length ?? 0;

  function handleTitlePress() {
    setIsSheetOpen(true);
  }

  function handleSheetClose() {
    setIsSheetOpen(false);
  }

  function handleRoomSelect(nextRoomId: RoomId) {
    setIsSheetOpen(false);
    if (nextRoomId !== roomId) onRoomSelect(nextRoomId);
  }

  const titleText = (
    <Text variant="heading-h4" numberOfLines={1} className="flex-shrink text-text-primary">
      {title}
    </Text>
  );

  if (roomCount < 2) return titleText;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}, 다른 그룹 보기`}
        className="flex-shrink flex-row items-center gap-[4px]"
        onPress={handleTitlePress}
      >
        {titleText}
        <ChevronDownIcon />
      </Pressable>
      <GroupSwitcherSheet
        visible={isSheetOpen}
        currentRoomId={roomId}
        onClose={handleSheetClose}
        onRoomSelect={handleRoomSelect}
      />
    </>
  );
}
