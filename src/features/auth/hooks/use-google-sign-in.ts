import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useMutation } from '@tanstack/react-query';

import { googleLogin } from '@/src/features/auth/api/auth';
import { startSession } from '@/src/features/auth/lib/start-session';

/**
 * 온보딩의 "로그인 하기" 버튼이 쓰는 훅. 네이티브 구글 로그인 → 서버 로그인(§12)까지
 * 한 번에 처리한다. 사용자가 구글 로그인 창에서 취소한 경우는 에러가 아니라 그냥
 * `null` 을 돌려준다 — 화면이 에러 문구를 띄우지 않게 하기 위함.
 */
export default function useGoogleSignIn() {
  return useMutation({
    mutationFn: async () => {
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();

      if (result.type === 'cancelled') {
        return null;
      }

      const { idToken } = result.data;
      if (!idToken) {
        throw new Error('구글 로그인에서 idToken을 받지 못했습니다.');
      }

      return googleLogin(idToken);
    },
    onSuccess: async (result) => {
      if (!result) {
        return;
      }

      // 이전 계정 정리와 세션 저장은 애플 로그인과 같다(start-session).
      await startSession(result);
    },
    onError: (error) => {
      // 화면에는 일반 문구만 보여준다(§11) — 실제 원인은 Metro/adb 로그에서 확인한다.
      // 프로덕션 전 크래시 리포팅(§14)이 붙으면 여기서 그쪽으로 보낸다.
      console.error('[useGoogleSignIn] 로그인 실패:', error);
    },
  });
}
