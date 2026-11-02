import type { Gender } from '@/src/features/my-page/types';

/**
 * 서버 성별(enum 없는 string)을 앱 값으로 읽는다. 앱이 모르는 값(빈 값 등)은 없는 것으로 본다.
 *
 * 서버는 저장할 때 소문자(`female`)를 받지만 돌려줄 때는 대문자(`FEMALE`)로 준다(시뮬레이터에서
 * `GET /api/users/me` 로 확인). 대소문자를 가리면 저장해도 "성별 없음"으로 보여 나이·성별 안내가
 * 계속 떴다(사용자 지적) — 그래서 대소문자 없이 비교한다.
 */
export function toKnownGender(gender: string | null | undefined): Gender | undefined {
  const normalized = gender?.trim().toLowerCase();
  return normalized === 'female' || normalized === 'male' ? normalized : undefined;
}
