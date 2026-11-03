import { useMutation } from '@tanstack/react-query';

import { joinRoomByInviteCode } from '@/src/features/diaries/api/diary-rooms';
import { invalidateDiaryFeeds } from '@/src/features/diaries/api/invalidate';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import type { JoinRoomRequest } from '@/src/features/diaries/types';
import queryClient from '@/src/lib/query-client';

/**
 * 초대코드로 그룹 참여. 들어가면 내 방 목록 · 그 방 정보(인원 수) · 멤버 목록 · 일기 피드가 바뀌므로
 * 다시 불러온다.
 */
export default function useJoinRoom() {
  return useMutation({
    mutationFn: (input: JoinRoomRequest) => joinRoomByInviteCode(input),
    onSuccess: ({ roomId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: roomKeys.list() }),
        queryClient.invalidateQueries({ queryKey: roomKeys.room(roomId) }),
        queryClient.invalidateQueries({ queryKey: roomKeys.members(roomId) }),
        invalidateDiaryFeeds(),
      ]),
  });
}
