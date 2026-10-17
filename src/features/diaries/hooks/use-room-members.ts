import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getRoomMembers } from '@/src/features/diaries/api/diary-rooms';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import type { RoomId } from '@/src/features/diaries/types';

/** 공유방 멤버 목록(방장 · 멤버만 볼 수 있다). */
export default function useRoomMembers(roomId: RoomId) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: roomKeys.members(roomId),
    queryFn: () => getRoomMembers(roomId),
    enabled: isAuthenticated,
  });
}
