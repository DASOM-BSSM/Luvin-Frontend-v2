import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getRoom } from '@/src/features/diaries/api/diary-rooms';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import type { RoomId } from '@/src/features/diaries/types';

/** 공유방 하나(방장 · 멤버만 볼 수 있다). 경로 파라미터가 숫자가 아니면 부르지 않는다. */
export default function useRoom(roomId: RoomId) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: roomKeys.room(roomId),
    queryFn: () => getRoom(roomId),
    enabled: isAuthenticated && !Number.isNaN(roomId),
  });
}
