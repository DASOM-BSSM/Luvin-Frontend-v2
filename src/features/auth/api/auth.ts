import httpClient from '@/src/lib/http-client';

import type { AuthUser } from '@/src/features/auth/types';

/** openapi `ApiResponse*` 계열 공통 껍데기. */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** openapi `AuthLoginResponse`. */
interface AuthLoginResponseBody {
  userId: number;
  nickname: string;
  isNewUser: boolean;
  accessToken: string;
}

/** 구글·애플 로그인 공통 결과. 둘 다 `AuthLoginResponse` 를 준다. */
export interface SocialLoginResult {
  user: AuthUser;
  accessToken: string;
}

function toLoginResult(body: AuthLoginResponseBody): SocialLoginResult {
  return {
    user: {
      userId: body.userId,
      nickname: body.nickname,
      isNewUser: body.isNewUser,
    },
    accessToken: body.accessToken,
  };
}

/**
 * 구글 idToken 으로 서버 로그인/가입을 한 번에 처리한다(별도 가입 화면 없음, §12).
 * `POST /api/auth/google`.
 */
export async function googleLogin(idToken: string): Promise<SocialLoginResult> {
  const { data } = await httpClient.post<ApiEnvelope<AuthLoginResponseBody>>('/api/auth/google', {
    idToken,
  });

  return toLoginResult(data.data);
}

/** openapi `AppleLoginRequest`. */
export interface AppleLoginRequest {
  identityToken: string;
  /**
   * 애플 인가 코드. 서버가 애플 토큰으로 바꿔 두었다가 계정 탈퇴 때 애플 연동을 해제(revoke)하는 데
   * 쓴다(백엔드 확인). 애플이 주지 않았으면 생략한다.
   */
  authorizationCode?: string;
  /** 이름. 애플은 처음 로그인할 때만 주고 그 뒤로는 비워서 준다 — 서버가 처음 받은 값을 저장한다. */
  fullName?: string;
}

/**
 * 애플 identityToken 으로 서버 로그인/가입을 한 번에 처리한다(구글과 같이 별도 가입 화면 없음).
 * `POST /api/auth/apple`.
 */
export async function appleLogin(request: AppleLoginRequest): Promise<SocialLoginResult> {
  const { data } = await httpClient.post<ApiEnvelope<AuthLoginResponseBody>>('/api/auth/apple', request);

  return toLoginResult(data.data);
}

/** `POST /api/auth/logout`. */
export async function logout(): Promise<void> {
  await httpClient.post('/api/auth/logout');
}
