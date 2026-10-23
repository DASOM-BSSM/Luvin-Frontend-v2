/**
 * [DRAFT] 새 10화 API 오류 코드 판별. 서버 message 는 화면에 쓰지 않고 code 만 본다(§11).
 */
import axios from 'axios';

export const STORY_ERROR_CODES = [
  'AGE_REQUIRED',
  'STORY_NOT_STARTED',
  'PREVIOUS_EPISODE_NOT_COMPLETED',
  'EPISODE_NOT_RELEASED',
  'SEASON_COMPLETED',
  'LEGACY_SEASON',
  'CONTENT_NOT_READY',
  'CHOICE_REQUIRED',
  'CHOICE_ALREADY_MADE',
  'STORY_GENERATION_FAILED',
] as const;

export type StoryErrorCode = (typeof STORY_ERROR_CODES)[number];

function isStoryErrorCode(value: unknown): value is StoryErrorCode {
  return STORY_ERROR_CODES.some((code) => code === value);
}

export function getStoryErrorCode(error: unknown): StoryErrorCode | null {
  if (!axios.isAxiosError<{ code?: string }>(error)) return null;
  const code = error.response?.data?.code;
  return isStoryErrorCode(code) ? code : null;
}

/** 회차 생성이 60초를 넘겼을 때. 다시 시도 버튼으로 이어진다. */
export class EpisodeGenerationTimeoutError extends Error {
  constructor() {
    super('Episode generation timed out');
    this.name = 'EpisodeGenerationTimeoutError';
  }
}
