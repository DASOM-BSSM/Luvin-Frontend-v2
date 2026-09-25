import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useMutation } from '@tanstack/react-query';

import { logout } from '@/src/features/auth/api/auth';
import { clearAccessToken } from '@/src/features/auth/lib/token-storage';
import { useAuthStore } from '@/src/features/auth/store/auth-store';
import queryClient from '@/src/lib/query-client';

/**
 * 마이페이지의 "로그아웃"이 쓰는 훅. 서버 로그아웃 → 로컬 정리까지 한 번에 처리한다.
 *
 * 서버 로그아웃이 실패해도(네트워크 등) 로컬 세션은 그대로 정리한다 — 사용자 입장에서
 * "로그아웃했는데 안 됐다"보다 "로그아웃은 됐는데 서버 기록만 못 남았다"가 덜 나쁘다.
 */
export default function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: async () => {
      try {
        await logout();
      } finally {
        await GoogleSignin.signOut();
        await clearAccessToken();
      }
    },
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });
}
