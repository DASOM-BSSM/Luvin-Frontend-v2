import { skipToken, useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import { getRoomQuestion } from '@/src/features/diaries/api/room-questions';
import type { RoomId, RoomQuestionId } from '@/src/features/diaries/types';

/** 그룹 질문 하나(지난 칸의 질문 답 모달). questionId 가 없으면 부르지 않는다. */
export default function useRoomQuestion(roomId: RoomId, questionId: RoomQuestionId | undefined) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: roomKeys.question(roomId, questionId ?? Number.NaN),
    queryFn: questionId === undefined ? skipToken : () => getRoomQuestion(roomId, questionId),
    enabled: isAuthenticated && !Number.isNaN(roomId),
  });
}
