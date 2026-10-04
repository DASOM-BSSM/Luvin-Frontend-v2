import { useMutation } from '@tanstack/react-query';

import { deleteRoom } from '@/src/features/diaries/api/diary-rooms';
import { invalidateDiaryFeeds } from '@/src/features/diaries/api/invalidate';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import type { RoomId } from '@/src/features/diaries/types';
import queryClient from '@/src/lib/query-client';

/**
 * 공유방 삭제(방장만). 방에 있던 일기도 같이 지워지므로 일기 목록들도 다시 불러온다.
 */
export default function useDeleteRoom() {
  return useMutation({
    mutationFn: (roomId: RoomId) => deleteRoom(roomId),
    onSuccess: (_, roomId) => {
      queryClient.removeQueries({ queryKey: roomKeys.detail(roomId) });
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: roomKeys.list() }),
        invalidateDiaryFeeds(),
      ]);
    },
  });
}
