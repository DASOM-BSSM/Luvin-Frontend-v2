import axios from 'axios';

function getSeasonErrorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError<{ code?: string }>(error)) {
    return undefined;
  }

  return error.response?.data?.code;
}

/**
 * [DRAFT] `POST /api/ai/seasons/next` 실패가 "이미 진행 중인 시즌이 있다"는 뜻인지 판단한다.
 * 버튼을 두 번 눌렀거나 다른 기기에서 먼저 새 시즌을 열었을 때다 — 새 시즌은 이미 있으니 실패로
 * 안내하지 않고 그 시즌으로 들어간다. message 는 바뀔 수 있어서 code 로만 판단한다.
 */
export function isSeasonInProgressError(error: unknown): boolean {
  if (!axios.isAxiosError<{ code?: string }>(error)) {
    return false;
  }

  return error.response?.status === 409 && error.response.data?.code === 'SEASON_IN_PROGRESS';
}

/**
 * [DRAFT] `POST /api/ai/seasons/next` 가 409 `STORY_NOT_STARTED`(시즌이 하나도 없음)로 실패했는지.
 * 시즌 초기화 뒤처럼 시즌이 없으면 다음 시즌이 아니라 첫 시즌(`/from-survey`)을 만들어야 한다.
 */
export function isNoSeasonError(error: unknown): boolean {
  return getSeasonErrorCode(error) === 'STORY_NOT_STARTED';
}

/**
 * [DRAFT] `POST /api/ai/seasons/next` 가 409 `SURVEY_RESULT_STALE`(보낸 설문 결과가 최신이 아님)로
 * 실패했는지. 앱이 들고 있던 설문 결과가 오래됐을 때다 — 빼고 보내면 서버가 최신 결과를 쓴다.
 */
export function isSurveyResultStaleError(error: unknown): boolean {
  return getSeasonErrorCode(error) === 'SURVEY_RESULT_STALE';
}
