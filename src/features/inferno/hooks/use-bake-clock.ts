import { useLayoutEffect, useRef } from 'react';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { BAKE } from '@/src/features/inferno/constants/bake';
import useJumpRopePlayback from '@/src/features/inferno/hooks/use-jump-rope-playback';
import { advanceBakeTime, isBakeComplete } from '@/src/features/inferno/utils/bake-timing';

/**
 * ep5 RESULT 등장 연출의 UI 스레드 시계. 줄넘기 로더(use-jump-rope-clock)처럼 모든 움직임을 시계 하나에서
 * 계산한다 — withRepeat 체인을 여러 개 겹쳐 걸지 않는다(인트로 지글거림이 Android 에서 겹친 체인
 * 때문에 죽은 적이 있다).
 *
 * `isPlaying` 이 false 면 처음부터 끝 시각에 둔다 — 연출 없이 RESULT 를 그대로 보여 준다. 화면·앱을 벗어나면
 * 줄넘기와 같은 규칙으로 시계를 멈추고, 돌아오면 같은 장면에서 이어 간다.
 */
export default function useBakeClock(isPlaying: boolean, onComplete: () => void) {
  const time = useSharedValue<number>(isPlaying ? 0 : BAKE.endSec);
  const completed = useSharedValue(!isPlaying);
  const control = useRef({ mounted: false, onComplete });

  function handleBakeComplete() {
    if (!control.current.mounted) {
      return;
    }
    frame.setActive(false);
    control.current.onComplete();
  }

  const frame = useFrameCallback(({ timeSincePreviousFrame }) => {
    if (completed.value) return;

    const delta = Math.min((timeSincePreviousFrame ?? 0) / 1000, BAKE.maxFrameSec);
    time.value = advanceBakeTime(time.value, delta);

    if (isBakeComplete(time.value)) {
      completed.value = true;
      scheduleOnRN(handleBakeComplete);
    }
  }, false);

  useLayoutEffect(() => {
    control.current.mounted = true;
    return () => {
      control.current.mounted = false;
    };
  }, []);

  useLayoutEffect(() => {
    control.current.onComplete = onComplete;
  }, [onComplete]);

  useJumpRopePlayback(frame, time, completed, isPlaying);
  return time;
}
