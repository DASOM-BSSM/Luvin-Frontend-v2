import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import { getCurrentRoomQuestion } from '@/src/features/diaries/api/room-questions';
import type { RoomId } from '@/src/features/diaries/types';
import { QUESTION_POLL_INTERVAL_MS } from '@/src/features/diaries/utils/question';

/**
 * 지금 그룹 질문. 질문이 한 번도 없으면 data 가 null 이다. `generating` 인 동안에는 서버 안내대로
 * 몇 초마다 다시 불러서 `ready` · `failed` 로 바뀌는 걸 잡는다.
 */
export default function useCurrentQuestion(roomId: RoomId) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: roomKeys.currentQuestion(roomId),
    queryFn: () => getCurrentRoomQuestion(roomId),
    enabled: isAuthenticated && !Number.isNaN(roomId),
    refetchInterval: (query) =>
      query.state.data?.status === 'generating' ? QUESTION_POLL_INTERVAL_MS : false,
  });
}
