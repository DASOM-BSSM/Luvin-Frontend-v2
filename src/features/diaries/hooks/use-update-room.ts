import { useMutation } from '@tanstack/react-query';

import { updateRoom, type UpdateRoomInput } from '@/src/features/diaries/api/diary-rooms';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import queryClient from '@/src/lib/query-client';

/** 공유방 수정(방장만). */
export default function useUpdateRoom() {
  return useMutation({
    mutationFn: (input: UpdateRoomInput) => updateRoom(input),
    // 방장 닉네임도 같이 바뀔 수 있어 멤버 목록까지 다시 불러온다.
    onSuccess: (_, { roomId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: roomKeys.list() }),
        queryClient.invalidateQueries({ queryKey: roomKeys.room(roomId) }),
        queryClient.invalidateQueries({ queryKey: roomKeys.members(roomId) }),
      ]),
  });
}
