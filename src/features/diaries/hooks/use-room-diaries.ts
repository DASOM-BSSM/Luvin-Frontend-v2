import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getRoomDiaries } from '@/src/features/diaries/api/diary-rooms';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import type { RoomId } from '@/src/features/diaries/types';

/** 공유방 일기 피드. roomId 가 아직 없으면(방 목록을 불러오는 중 등) 부르지 않는다. */
export default function useRoomDiaries(roomId: RoomId | undefined) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: roomKeys.diaries(roomId ?? 0),
    queryFn: () => getRoomDiaries(roomId as RoomId),
    enabled: isAuthenticated && roomId !== undefined,
  });
}
