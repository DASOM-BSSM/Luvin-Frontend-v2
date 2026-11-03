import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import { getRoomQuestionHistory } from '@/src/features/diaries/api/room-questions';
import type { RoomId } from '@/src/features/diaries/types';

/** 지난 그룹 질문 목록(최신순, 답 수만). 질문 모달과 감정일기 메인의 칸 막대(몇 번째 질문인지)가 쓴다. */
export default function useQuestionHistory(roomId: RoomId, enabled: boolean) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: roomKeys.questionHistory(roomId),
    queryFn: () => getRoomQuestionHistory(roomId),
    enabled: enabled && isAuthenticated && !Number.isNaN(roomId),
  });
}
