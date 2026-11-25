import { Pressable, View } from 'react-native';

import DraggableSheet from '@/src/components/ui/draggable-sheet';
import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import useMyRooms from '@/src/features/diaries/hooks/use-my-rooms';
import type { DiaryRoom, RoomId } from '@/src/features/diaries/types';

interface GroupSwitcherSheetProps {
  visible: boolean;
  /** 지금 보고 있는 그룹 — 목록에서 칠해 둔다. */
  currentRoomId?: RoomId;
  onClose: () => void;
  onRoomSelect: (roomId: RoomId) => void;
}

interface RoomRowProps {
  room: DiaryRoom;
  selected: boolean;
  onPress: (roomId: RoomId) => void;
}

/** 그룹 한 줄 — 이름 + 인원. 지금 그룹은 멤버 목록 칸(6606:4161)과 같은 연한 노랑으로 칠한다. */
function RoomRow({ room, selected, onPress }: RoomRowProps) {
  function handlePress() {
    onPress(room.id);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`w-full flex-row items-center justify-between gap-[8px] rounded-[8px] border px-[20px] py-[10px] ${
        selected ? 'border-yellow-300 bg-yellow-200' : 'border-default-gray bg-default-white'
      }`}
      onPress={handlePress}
    >
      <Text variant="body-xs" numberOfLines={1} className="flex-shrink text-text-primary">
        {room.name}
      </Text>
      <Text variant="body-xxs" className="text-text-muted">
        {room.memberCount}/{room.maxMemberCount}명
      </Text>
    </Pressable>
  );
}

/**
 * 내 그룹 목록 시트(`GET /api/diary-rooms` — 최근 참여한 순). 그룹을 누르면 `onRoomSelect` 로 알린다.
 * 홈 "쫀쫀한 조합들" 제목과 감정일기 메인의 그룹 이름에서 연다(여러 그룹 참여). 시안이 없어 일기 모아보기
 * 시트 모양에 멤버 목록 칸을 빌려 그렸다 — [DRAFT].
 */
export default function GroupSwitcherSheet({
  visible,
  currentRoomId,
  onClose,
  onRoomSelect,
}: GroupSwitcherSheetProps) {
  const roomsQuery = useMyRooms();

  function handleRetryPress() {
    roomsQuery.refetch();
  }

  function renderBody() {
    if (roomsQuery.isLoading) {
      return (
        <Text variant="body-xs" className="text-text-muted">
          불러오는 중...
        </Text>
      );
    }
    if (roomsQuery.isError) {
      return (
        <Pressable accessibilityRole="button" onPress={handleRetryPress}>
          <Text variant="body-xs" className="text-state-error">
            {ERROR_MESSAGES.myRoomsFailed}
          </Text>
        </Pressable>
      );
    }
    const rooms = roomsQuery.data ?? [];
    if (rooms.length === 0) {
      return (
        <Text variant="body-xs" className="text-text-muted">
          참여한 그룹이 없어요
        </Text>
      );
    }
    return rooms.map((room) => (
      <RoomRow
        key={room.id}
        room={room}
        selected={room.id === currentRoomId}
        onPress={onRoomSelect}
      />
    ));
  }

  return (
    <DraggableSheet visible={visible} onClose={onClose}>
      <Text variant="heading-h5" className="text-text-primary">
        내 그룹
      </Text>
      <View className="w-full flex-col gap-[8px]">{renderBody()}</View>
    </DraggableSheet>
  );
}
