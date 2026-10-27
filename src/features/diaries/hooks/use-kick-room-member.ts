import { useMutation } from '@tanstack/react-query';

import { kickRoomMember, type RoomMemberInput } from '@/src/features/diaries/api/diary-rooms';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import queryClient from '@/src/lib/query-client';

/** 멤버 강퇴(방장만, 방장 자신은 400). */
export default function useKickRoomMember() {
  return useMutation({
    mutationFn: (input: RoomMemberInput) => kickRoomMember(input),
    // 인원 수(memberCount)도 줄어서 방 정보도 다시 불러온다. 서버는 강퇴하면 초대코드를 새로 만들어
    // 내보낸 사람이 이전 코드로 못 돌아오게 하므로 초대코드도 다시 불러온다.
    onSuccess: (_, { roomId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: roomKeys.members(roomId) }),
        queryClient.invalidateQueries({ queryKey: roomKeys.room(roomId) }),
        queryClient.invalidateQueries({ queryKey: roomKeys.inviteCode(roomId) }),
      ]),
  });
}
