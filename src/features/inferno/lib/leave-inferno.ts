import { router, type Href } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Platform } from 'react-native';

/** 세로 회전 신호를 이만큼 기다려도 안 오면 그냥 나간다. 회전이 이미 끝났거나 신호를 놓친 경우다. */
const ROTATION_SIGNAL_TIMEOUT_MS = 800;

/** 회전 신호가 온 뒤 회전 애니메이션이 끝나기를 기다리는 시간. iOS 회전 애니메이션은 0.3~0.4초다. */
const ROTATION_SETTLE_MS = 400;

const PORTRAIT_ORIENTATIONS = [
  ScreenOrientation.Orientation.PORTRAIT_UP,
  ScreenOrientation.Orientation.PORTRAIT_DOWN,
];

/** 나가는 중에 버튼을 또 눌러도 한 번만 나가게 막는다. */
let isLeaving = false;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 화면이 세로로 바뀌었다는 신호를 기다린다. 신호가 안 와도 시간이 지나면 끝낸다. */
function waitForPortraitSignal(): Promise<void> {
  return new Promise((resolve) => {
    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      if (PORTRAIT_ORIENTATIONS.includes(event.orientationInfo.orientation)) {
        finish();
      }
    });
    const timer = setTimeout(finish, ROTATION_SIGNAL_TIMEOUT_MS);

    function finish() {
      subscription.remove();
      clearTimeout(timer);
      resolve();
    }
  });
}

/**
 * 러빈지옥(가로 화면)에서 세로 화면(홈 등)으로 나간다. 회차의 "잠시 나가기", "에피소드 끝내기" 가 쓴다.
 *
 * **먼저 세로로 돌리고, 회전이 끝난 뒤에** 화면을 닫는다. 예전에는 `router.dismissTo('/')` 만 불렀는데,
 * 그러면 경로가 바뀌는 순간 use-landscape-routes 가 세로 회전을 걸어서 iOS 가 회차 화면 두 장(회차,
 * 인트로)을 닫는 전환과 회전이 겹쳤다. 그때 iOS 네이티브 스택이 전환을 끝내지 못하고 가로 화면이 세로로
 * 찌그러진 채 멈췄다 — 내비게이션 상태는 이미 홈인데 화면만 남아 아무것도 눌리지 않았다(LUV-56,
 * 시뮬레이터 로그·스크린샷으로 확인).
 *
 * 회전하는 동안 회차 화면은 LandscapeOnly 가 감춰서 깨진 레이아웃이 보이지 않는다.
 */
export async function leaveInferno(href: Href = '/') {
  if (isLeaving) {
    return;
  }
  isLeaving = true;

  try {
    if (Platform.OS !== 'web') {
      const orientation = await ScreenOrientation.getOrientationAsync();

      if (!PORTRAIT_ORIENTATIONS.includes(orientation)) {
        const portraitSignal = waitForPortraitSignal();
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        await portraitSignal;
        await wait(ROTATION_SETTLE_MS);
      }
    }

    router.dismissTo(href);
  } finally {
    isLeaving = false;
  }
}
