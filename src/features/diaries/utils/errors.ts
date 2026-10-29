import axios from 'axios';

import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import type { RoomQuestion } from '@/src/features/diaries/types';

/** 인원이 가득 찬 방에 참여하려 할 때 서버가 주는 코드(409). */
const DIARY_ROOM_FULL_CODE = 'DIARY_ROOM_FULL';
/** 같은 방에 같은 닉네임이 이미 있을 때 서버가 주는 코드(409). */
const DIARY_ROOM_NICKNAME_DUPLICATED_CODE = 'DIARY_ROOM_NICKNAME_DUPLICATED';
/** 오늘 그룹 질문이 이미 있을 때(생성 중 포함) 서버가 주는 코드(409). data 에 그 질문이 온다. */
const ROOM_QUESTION_ALREADY_EXISTS_CODE = 'ROOM_QUESTION_ALREADY_EXISTS';
/** 그룹 질문 답이 1~200자가 아닐 때 서버가 주는 코드(400). */
const ROOM_ANSWER_INVALID_CODE = 'ROOM_ANSWER_INVALID';
/** generating · failed 인 질문에 답하려 할 때 서버가 주는 코드(409). */
const ROOM_QUESTION_NOT_READY_CODE = 'ROOM_QUESTION_NOT_READY';

/**
 * 방 하나 조회 실패가 "볼 수 없는 방"인지 — 없는 방(404)이거나 내가 멤버가 아닌 방(403).
 * 이 경우는 다시 시도해도 같아서 화면에서 재시도 대신 "찾을 수 없어요"를 보여준다.
 */
export function isRoomUnavailableError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }
  const status = error.response?.status;
  return status === 403 || status === 404;
}

/**
 * 그룹 참여 실패 → 화면 문구. 서버 문구를 그대로 보여주지 않고 앱 문구로 바꾼다(§11).
 * 409 는 message 가 바뀔 수 있어서 code 로만 가른다.
 */
export function getJoinRoomErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<{ code?: string }>(error)) {
    return ERROR_MESSAGES.joinRoomFailed;
  }

  const status = error.response?.status;
  const code = error.response?.data?.code;

  if (status === 404) {
    return ERROR_MESSAGES.invalidInviteCode;
  }
  if (status === 409 && code === DIARY_ROOM_FULL_CODE) {
    return ERROR_MESSAGES.diaryRoomFull;
  }
  if (status === 409 && code === DIARY_ROOM_NICKNAME_DUPLICATED_CODE) {
    return ERROR_MESSAGES.diaryRoomNicknameDuplicated;
  }
  return ERROR_MESSAGES.joinRoomFailed;
}

/**
 * 질문 만들기가 409 `ROOM_QUESTION_ALREADY_EXISTS` 로 막혔으면 그때 온 오늘 질문을 꺼낸다 — 다른 멤버가
 * 먼저 눌렀을 때라 실패가 아니라 그 질문을 보여주면 된다. 그 밖의 실패면 undefined.
 */
export function getExistingQuestion(error: unknown): RoomQuestion | undefined {
  if (!axios.isAxiosError<{ code?: string; data?: RoomQuestion | null }>(error)) {
    return undefined;
  }
  const { status, data } = error.response ?? {};
  if (status !== 409 || data?.code !== ROOM_QUESTION_ALREADY_EXISTS_CODE) {
    return undefined;
  }
  return data.data ?? undefined;
}

/** 그룹 질문 답 저장 실패 → 화면 문구. code 로만 가른다(§11). */
export function getAnswerQuestionErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<{ code?: string }>(error)) {
    return ERROR_MESSAGES.answerQuestionFailed;
  }
  const code = error.response?.data?.code;
  if (code === ROOM_ANSWER_INVALID_CODE) {
    return ERROR_MESSAGES.roomAnswerInvalid;
  }
  if (code === ROOM_QUESTION_NOT_READY_CODE) {
    return ERROR_MESSAGES.roomQuestionNotReady;
  }
  return ERROR_MESSAGES.answerQuestionFailed;
}
