import { useMutation } from '@tanstack/react-query';
import * as AppleAuthentication from 'expo-apple-authentication';

import { appleLogin } from '@/src/features/auth/api/auth';
import { startSession } from '@/src/features/auth/lib/start-session';

/** 사용자가 애플 로그인 창을 닫았을 때 `signInAsync` 가 던지는 에러 코드. */
const APPLE_SIGN_IN_CANCELED = 'ERR_REQUEST_CANCELED';

function isAppleSignInCanceled(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === APPLE_SIGN_IN_CANCELED;
}

/**
 * 애플이 준 이름을 서버에 보낼 한 줄로 만든다. 언어에 맞는 순서로 붙인다(한국어면 "성이름").
 * 애플은 처음 로그인할 때만 이름을 주고 그 뒤로는 비워서 준다 — 그때는 보내지 않는다.
 */
function toFullName(fullName: AppleAuthentication.AppleAuthenticationFullName | null): string | undefined {
  if (!fullName) {
    return undefined;
  }

  const formatted = AppleAuthentication.formatFullName(fullName).trim();
  return formatted.length > 0 ? formatted : undefined;
}

/**
 * 온보딩의 "Apple로 로그인 하기" 버튼이 쓰는 훅. 네이티브 애플 로그인 → 서버 로그인
 * (`POST /api/auth/apple`)까지 한 번에 처리한다. iOS 전용이라 Android 에서는 버튼 자체를 두지 않는다.
 *
 * 구글과 같이, 사용자가 애플 로그인 창에서 취소하면 에러가 아니라 `null` 을 돌려준다 — 화면이 에러
 * 문구를 띄우지 않게 하기 위함(use-google-sign-in 과 같다).
 *
 * `authorizationCode` 는 서버가 계정 탈퇴 때 애플 연동을 해제하는 데 쓴다(백엔드 확인). 탈퇴는 구글과
 * 같은 `DELETE /api/users/me` 하나로 끝나고, 해제는 서버가 한다.
 */
export default function useAppleSignIn() {
  return useMutation({
    mutationFn: async () => {
      let credential: AppleAuthentication.AppleAuthenticationCredential;
      try {
        credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
      } catch (error) {
        if (isAppleSignInCanceled(error)) {
          return null;
        }

        throw error;
      }

      if (!credential.identityToken) {
        throw new Error('애플 로그인에서 identityToken을 받지 못했습니다.');
      }

      return appleLogin({
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode ?? undefined,
        fullName: toFullName(credential.fullName),
      });
    },
    onSuccess: async (result) => {
      if (!result) {
        return;
      }

      // 이전 계정 정리와 세션 저장은 구글 로그인과 같다(start-session).
      await startSession(result);
    },
    onError: (error) => {
      // 화면에는 일반 문구만 보여준다(§11) — 실제 원인은 Metro/기기 로그에서 확인한다(use-google-sign-in 과 같다).
      console.error('[useAppleSignIn] 로그인 실패:', error);
    },
  });
}
