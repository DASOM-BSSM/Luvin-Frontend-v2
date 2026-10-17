import { useMutation } from '@tanstack/react-query';

import { kickRoomMember, type RoomMemberInput } from '@/src/features/diaries/api/diary-rooms';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import queryClient from '@/src/lib/query-client';

/** 멤버 강퇴(방장만, 방장 자신은 400). */
export default function useKickRoomMember() {
  return useMutation({
    mutationFn: (input: RoomMemberInput) => kickRoomMember(input),
    onSuccess: (_, { roomId }) =>
      queryClient.invalidateQueries({ queryKey: roomKeys.members(roomId) }),
  });
}
