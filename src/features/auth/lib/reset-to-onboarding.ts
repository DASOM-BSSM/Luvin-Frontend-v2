import { router } from 'expo-router';

import { hasSeenTour } from '@/src/features/welcome/lib/tour-seen';

/**
 * 쌓인 화면을 전부 닫고 온보딩 하나만 남긴다. 로그아웃·계정 탈퇴·세션 만료처럼 로그인 상태가
 * 끝날 때 쓴다.
 *
 * 앱을 처음 켜서 로그인 안 된 채 홈에 오면 이 함수로 온보딩에 오는데, 이 기기에서 앱 소개 투어를
 * 아직 안 봤으면 온보딩 대신 투어(`/welcome`)로 보낸다 — 투어가 끝나면 온보딩으로 간다(사용자 결정).
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

  router.replace(hasSeenTour() ? '/onboarding' : '/welcome');
}
