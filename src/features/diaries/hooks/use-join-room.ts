import { useMutation } from '@tanstack/react-query';

import { joinRoomByInviteCode } from '@/src/features/diaries/api/diary-rooms';
import { invalidateDiaryFeeds } from '@/src/features/diaries/api/invalidate';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import queryClient from '@/src/lib/query-client';

/** 초대코드로 그룹 참여. 들어가면 내 방 목록과 일기 피드가 바뀌므로 다시 불러온다. */
export default function useJoinRoom() {
  return useMutation({
    mutationFn: (inviteCode: string) => joinRoomByInviteCode(inviteCode),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: roomKeys.list() }),
        invalidateDiaryFeeds(),
      ]),
  });
}
