import { useMutation } from '@tanstack/react-query';

import { updateRoom, type UpdateRoomInput } from '@/src/features/diaries/api/diary-rooms';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import queryClient from '@/src/lib/query-client';

/** 공유방 수정(방장만). */
export default function useUpdateRoom() {
  return useMutation({
    mutationFn: (input: UpdateRoomInput) => updateRoom(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roomKeys.list() }),
  });
}
