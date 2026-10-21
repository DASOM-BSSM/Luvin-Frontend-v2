import type { SocialLoginResult } from '@/src/features/auth/api/auth';
import { setAccessToken } from '@/src/features/auth/lib/token-storage';
import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { useBreadStore } from '@/src/features/bread/store/bread-store';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import { usePartnerLetterStore } from '@/src/features/inferno/store/partner-letter-store';
import { useSurveyStore } from '@/src/features/survey/store/survey-store';
import queryClient from '@/src/lib/query-client';

/**
 * 서버 로그인에 성공한 뒤 세션을 연다. 구글·애플 로그인이 같이 쓴다(use-google-sign-in,
 * use-apple-sign-in) — 어느 쪽으로 로그인하든 이전 계정 정리와 세션 저장은 같아야 한다.
 */
export async function startSession(result: SocialLoginResult) {
  // 로그아웃을 안 거치고 바로 다른 계정으로 로그인하는 경로(구글 계정 선택 화면에서
  // 다른 계정 선택 등)도 있어서, 로그아웃 때와 마찬가지로 이전 계정의 캐시를 여기서도
  // 지운다 — 안 그러면 새 계정인데 이전 계정의 시즌/반죽/설문 결과가 그대로 보인다
  // (사용자가 실기기에서 직접 재현한 버그).
  //
  // useInfernoStore(완료한 회차 목록)도 같이 지운다 — 이건 MMKV에 계정 구분 없이 저장돼서
  // 위 셋을 지워도 안 지워지면, 홈 화면의 "다음 에피소드"(findNextInfernoEpisode)가 이전
  // 계정이 완료한 회차 수만큼 건너뛴 회차를 새 계정 것인 양 보여준다 — 실제 서버 시즌은
  // 1화도 안 끝났는데 홈 화면만 2화부터 시작하는 것처럼 보이는 버그로 재현됨.
  //
  // LUV-56: 러빈지옥 진행 기록은 이제 계정별로 저장돼서 지우지 않고 이 계정의 기록으로 바꾼다 —
  // 같은 계정이면 이전 진행도가 그대로 이어지고, 다른 계정이면 그 계정 기록(없으면 빈 기록)이다.
  queryClient.clear();
  useBreadStore.getState().clear();
  useSurveyStore.getState().resetSurvey();
  useInfernoStore.getState().switchUser(result.user.userId);
  usePartnerLetterStore.getState().switchUser(result.user.userId);

  await setAccessToken(result.accessToken);
  useAuthStore.getState().setSession(result.user);
}
