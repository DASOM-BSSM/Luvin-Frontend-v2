import { useMutation } from '@tanstack/react-query';

import { addRoomMember, type RoomMemberInput } from '@/src/features/diaries/api/diary-rooms';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import queryClient from '@/src/lib/query-client';

/** 멤버 초대(방장만). 공유방은 스스로 참여하는 API 가 없어 이것이 유일한 참여 경로다. */
export default function useAddRoomMember() {
  return useMutation({
    mutationFn: (input: RoomMemberInput) => addRoomMember(input),
    onSuccess: (membership) =>
      queryClient.invalidateQueries({ queryKey: roomKeys.members(membership.roomId) }),
  });
}
