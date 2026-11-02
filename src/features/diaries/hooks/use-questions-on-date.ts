import { skipToken, useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { roomKeys } from '@/src/features/diaries/api/query-keys';
import { getRoomQuestionHistory } from '@/src/features/diaries/api/room-questions';
import type { RoomId } from '@/src/features/diaries/types';

/** 그날(KST "YYYY-MM-DD") 그룹 질문 목록 — 달력에서 고른 날. date 가 없으면 부르지 않는다. */
export default function useQuestionsOnDate(roomId: RoomId, date: string | undefined) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: roomKeys.questionHistoryOn(roomId, date ?? ''),
    queryFn: date === undefined ? skipToken : () => getRoomQuestionHistory(roomId, date),
    enabled: isAuthenticated && !Number.isNaN(roomId),
  });
}
