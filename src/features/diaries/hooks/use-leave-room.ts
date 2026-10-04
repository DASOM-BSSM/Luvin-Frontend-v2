import { useMutation } from '@tanstack/react-query';

import { leaveRoom } from '@/src/features/diaries/api/diary-rooms';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import type { RoomId } from '@/src/features/diaries/types';
import queryClient from '@/src/lib/query-client';

/** 공유방 나가기. 방장은 못 나간다(400) — 방장에게는 나가기 대신 삭제를 보여줄 것. */
export default function useLeaveRoom() {
  return useMutation({
    mutationFn: (roomId: RoomId) => leaveRoom(roomId),
    onSuccess: (_, roomId) => {
      queryClient.removeQueries({ queryKey: roomKeys.detail(roomId) });
      return queryClient.invalidateQueries({ queryKey: roomKeys.list() });
    },
  });
}
