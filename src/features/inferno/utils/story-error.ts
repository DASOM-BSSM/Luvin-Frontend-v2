/**
 * [DRAFT] 새 10화 API 오류 코드 판별. 서버 message 는 화면에 쓰지 않고 code 만 본다(§11).
 */
import axios from 'axios';

import { ERROR_MESSAGES } from '@/src/constants/error-messages';

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

/** 회차 본문을 못 받았을 때 보여줄 문구와 버튼. */
export type EpisodeErrorAction = 'retry' | 'first' | 'previous' | 'report' | 'age' | 'none';

export function describeEpisodeError(error: unknown): {
  message: keyof typeof ERROR_MESSAGES;
  action: EpisodeErrorAction;
} {
  if (error instanceof EpisodeGenerationTimeoutError)
    return { message: 'episodeGenerationTimeout', action: 'retry' };
  switch (getStoryErrorCode(error)) {
    case 'AGE_REQUIRED':
      return { message: 'ageRequired', action: 'age' };
    case 'STORY_NOT_STARTED':
      return { message: 'storyNotStarted', action: 'first' };
    case 'PREVIOUS_EPISODE_NOT_COMPLETED':
      return { message: 'previousEpisodeRequired', action: 'previous' };
    case 'EPISODE_NOT_RELEASED':
      return { message: 'episodeNotReleased', action: 'none' };
    case 'SEASON_COMPLETED':
      return { message: 'seasonCompleted', action: 'report' };
    default:
      // STORY_GENERATION_FAILED(502), status failed, 네트워크 오류. 다시 요청하면 서버가 다시 만든다.
      return { message: 'episodeLoadFailed', action: 'retry' };
  }
}
