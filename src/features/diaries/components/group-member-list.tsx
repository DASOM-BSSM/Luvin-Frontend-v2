import { Alert, Pressable, View } from 'react-native';

import RemoveCircleIcon from '@/src/assets/icons/RemoveCircleIcon';
import Text from '@/src/components/ui/text';
import useKickRoomMember from '@/src/features/diaries/hooks/use-kick-room-member';
import useRoomMembers from '@/src/features/diaries/hooks/use-room-members';
import type { DiaryRoomMember, RoomId, UserId } from '@/src/features/diaries/types';

interface GroupMemberListProps {
  roomId: RoomId;
  ownerId: UserId;
  /** 내가 방장이면 다른 멤버 옆에 x(내보내기) 버튼을 보여준다. */
  isOwner: boolean;
}

interface MemberRowProps {
  member: DiaryRoomMember;
  removable: boolean;
  onRemovePress: (member: DiaryRoomMember) => void;
}

/** 멤버 한 줄 — 연한 노랑 칸 + (방장일 때) x. Figma 6606:4161. */
function MemberRow({ member, removable, onRemovePress }: MemberRowProps) {
  function handleRemovePress() {
    onRemovePress(member);
  }

  return (
    <View className="w-full flex-row items-center gap-[8px]">
      <View className="flex-1 items-center justify-center overflow-hidden rounded-[8px] border border-yellow-300 bg-yellow-200 px-[20px] py-[6px]">
        <Text variant="body-xs" numberOfLines={1} className="text-text-primary">
          {member.name}
        </Text>
      </View>
      {removable ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${member.name} 내보내기`}
          hitSlop={8}
          onPress={handleRemovePress}
        >
          <RemoveCircleIcon />
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * 그룹 멤버 목록(Figma 6606:4049). `GET /api/diary-rooms/{roomId}/members` 를 그리고, 방장은 x 로
 * 멤버를 내보낼 수 있다(`DELETE .../members/kick`). 방장 자신은 내보낼 수 없어 x 를 숨긴다.
 *
 * 내보내기는 되돌릴 수 없어 `Alert.alert` 로 한 번 묻는다 — §11 의 "파괴적 동작 확인" 예외.
 */
export default function GroupMemberList({ roomId, ownerId, isOwner }: GroupMemberListProps) {
  const membersQuery = useRoomMembers(roomId);
  const kickMutation = useKickRoomMember();

  function handleRetryPress() {
    membersQuery.refetch();
  }

  function handleRemovePress(member: DiaryRoomMember) {
    if (kickMutation.isPending) return;
    Alert.alert('멤버 내보내기', `${member.name}님을 그룹에서 내보낼까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '내보내기',
        style: 'destructive',
        onPress: () => kickMutation.mutate({ roomId, userId: member.id }),
      },
    ]);
  }

  if (membersQuery.isLoading) {
    return (
      <Text variant="body-xs" className="text-text-muted">
        불러오는 중...
      </Text>
    );
  }

  if (membersQuery.isError) {
    return (
      <Pressable accessibilityRole="button" onPress={handleRetryPress}>
        <Text variant="body-xs" className="text-state-error">
          멤버를 불러오지 못했어요. 다시 시도
        </Text>
      </Pressable>
    );
  }

  return (
    <View className="w-full flex-col items-start gap-[12px]">
      {(membersQuery.data ?? []).map((member) => (
        <MemberRow
          key={member.id}
          member={member}
          removable={isOwner && member.id !== ownerId}
          onRemovePress={handleRemovePress}
        />
      ))}
      {kickMutation.isError ? (
        <Text variant="body-xs" className="text-state-error">
          멤버를 내보내지 못했어요. 다시 시도해 주세요
        </Text>
      ) : null}
    </View>
  );
}
