import { router } from 'expo-router';

/**
 * 쌓인 화면을 전부 닫고 온보딩 하나만 남긴다. 로그아웃·계정 탈퇴·세션 만료처럼 로그인 상태가
 * 끝날 때 쓴다.
 *
 * `router.replace('/onboarding')` 만 쓰면 맨 위 화면만 바뀌어서 아래 화면들이 그대로 남았다 —
 * 마이페이지에서 로그아웃하면 `[홈, 마이페이지, 온보딩]`, 다시 로그인하면 `[홈, 마이페이지, 홈]`
 * 처럼 홈이 두 개 쌓였다. 그 상태로 러빈지옥에 들어가 "잠시 나가기"(`dismissTo('/')`)를 누르면
 * 경로만 홈으로 바뀌어 화면이 세로로 돌아가고, iOS 에서는 회차 화면이 닫히지 않은 채 남았다(LUV-56).
 */
export function resetToOnboarding() {
  if (router.canDismiss()) {
    router.dismissAll();
  }

  router.replace('/onboarding');
}
