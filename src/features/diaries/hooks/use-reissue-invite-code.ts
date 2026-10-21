import { useMutation } from '@tanstack/react-query';

import { reissueRoomInviteCode } from '@/src/features/diaries/api/diary-rooms';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import type { RoomId } from '@/src/features/diaries/types';
import queryClient from '@/src/lib/query-client';

/** 초대코드 재발급(방장만). 이전 코드는 바로 못 쓰게 되니 새 코드로 캐시를 덮는다. */
export default function useReissueInviteCode() {
  return useMutation({
    mutationFn: (roomId: RoomId) => reissueRoomInviteCode(roomId),
    onSuccess: (result) => {
      queryClient.setQueryData(roomKeys.inviteCode(result.roomId), result);
    },
  });
}
