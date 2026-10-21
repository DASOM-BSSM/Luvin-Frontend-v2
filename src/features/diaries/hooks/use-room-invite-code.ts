import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getRoomInviteCode } from '@/src/features/diaries/api/diary-rooms';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import type { RoomId } from '@/src/features/diaries/types';

/** 그룹 초대코드(방장 · 멤버만). 그룹 설정하기 화면에서 보여주고 복사한다. */
export default function useRoomInviteCode(roomId: RoomId) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: roomKeys.inviteCode(roomId),
    queryFn: () => getRoomInviteCode(roomId),
    enabled: isAuthenticated,
  });
}
