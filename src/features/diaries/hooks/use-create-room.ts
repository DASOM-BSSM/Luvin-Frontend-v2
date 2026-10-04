import { useMutation } from '@tanstack/react-query';

import { createRoom } from '@/src/features/diaries/api/diary-rooms';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import type { DiaryRoomWriteRequest } from '@/src/features/diaries/types';
import queryClient from '@/src/lib/query-client';

/** 공유방 만들기. 만든 사람이 방장이 된다. */
export default function useCreateRoom() {
  return useMutation({
    mutationFn: (input: DiaryRoomWriteRequest) => createRoom(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roomKeys.list() }),
  });
}
