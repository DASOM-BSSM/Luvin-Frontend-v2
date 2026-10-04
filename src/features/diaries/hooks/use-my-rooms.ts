import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getMyRooms } from '@/src/features/diaries/api/diary-rooms';
import { roomKeys } from '@/src/features/diaries/api/query-keys';

/** 내가 방장이거나 멤버인 공유방 목록. */
export default function useMyRooms() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: roomKeys.list(),
    queryFn: getMyRooms,
    enabled: isAuthenticated,
  });
}
