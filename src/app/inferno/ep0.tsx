import { Redirect } from 'expo-router';

import { infernoIntroHref } from '@/src/features/inferno/constants/routes';

/** 가이드 회차를 없애고 늘 여기서 시작한다. */
const FIRST_ORDER = 1;

/**
 * 예전 가이드 회차(ep0) 자리. ep0 은 없앴지만(사용자 결정) 라우트 경로는 딥링크·알림의 계약이라(§13)
 * 지우지 않고 1화 시작 화면으로 넘긴다. 본문이 아니라 시작 화면으로 보내는 건 ep0 도 시작 화면을
 * 거쳐 들어가던 흐름과 같게 하려는 것이다.
 */
export default function InfernoEp0Redirect() {
  return <Redirect href={infernoIntroHref(FIRST_ORDER)} />;
}
