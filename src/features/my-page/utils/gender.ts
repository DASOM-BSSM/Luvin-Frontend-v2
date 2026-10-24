import type { Gender } from '@/src/features/my-page/types';

/** 서버 성별(enum 없는 string)이 앱이 아는 값이면 그대로, 아니면(빈 값·다른 포맷) 없는 것으로 본다. */
export function toKnownGender(gender: string | null | undefined): Gender | undefined {
  return gender === 'female' || gender === 'male' ? gender : undefined;
}
