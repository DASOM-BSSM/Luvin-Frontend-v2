import type { Href } from 'expo-router';

import type { AuthUser } from '@/src/features/auth/types';

/**
 * 로그인 직후 보낼 곳. 첫 로그인(=가입)일 때만 환영 화면을 거친다.
 *
 * 계정 탈퇴 후 같은 구글 계정으로 다시 로그인해도 서버가 새 계정으로 만들어 `isNewUser` 를
 * true 로 주므로 따로 다룰 필요가 없다. 앱을 다시 켜서 hydrate 로 로그인된 경우는 user 가
 * 없어서(null) 홈으로 간다 — 환영 화면은 로그인한 그 순간에만 보인다.
 */
export function getPostLoginHref(user: AuthUser | null): Href {
  return user?.isNewUser ? '/welcome' : '/';
}
