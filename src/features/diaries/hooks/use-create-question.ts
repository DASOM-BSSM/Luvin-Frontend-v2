import { useMutation } from '@tanstack/react-query';

import { roomKeys } from '@/src/features/diaries/api/query-keys';
import { createRoomQuestion } from '@/src/features/diaries/api/room-questions';
import type { RoomId, RoomQuestion } from '@/src/features/diaries/types';
import { getExistingQuestion } from '@/src/features/diaries/utils/errors';
import queryClient from '@/src/lib/query-client';

/** 409 `ROOM_QUESTION_ALREADY_EXISTS` 면 그때 온 오늘 질문을 결과로 쓴다(다른 멤버가 먼저 눌렀다). */
async function createOrGetExisting(roomId: RoomId): Promise<RoomQuestion> {
  try {
    return await createRoomQuestion(roomId);
  } catch (error) {
    const existing = getExistingQuestion(error);
    if (existing) return existing;
    throw error;
  }
}

/**
 * 그룹 질문 만들기. 받은 질문(보통 `generating`)을 지금 질문 캐시에 바로 넣는다 — 그러면
 * `useCurrentQuestion` 이 `ready` 가 될 때까지 다시 부른다.
 */
export default function useCreateQuestion(roomId: RoomId) {
  return useMutation({
    mutationFn: () => createOrGetExisting(roomId),
    onSuccess: (question) => {
      queryClient.setQueryData(roomKeys.currentQuestion(roomId), question);
      return queryClient.invalidateQueries({ queryKey: roomKeys.questionHistory(roomId) });
    },
  });
}
