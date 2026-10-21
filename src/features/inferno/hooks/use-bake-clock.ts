import { useEffect, useLayoutEffect, useRef } from 'react';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { BAKE } from '@/src/features/inferno/constants/bake';
import useJumpRopePlayback from '@/src/features/inferno/hooks/use-jump-rope-playback';
import { advanceBakeTime, hasBakeSwapped, isBakeComplete } from '@/src/features/inferno/utils/bake-timing';

interface UseBakeClockOptions {
  /** 연출을 틀지. false 면 처음부터 끝 시각에 둔다 — 연출 없이 1페이지를 그대로 보여 준다. */
  isPlaying: boolean;
  /** 리포트가 왔는지. 오기 전에는 연기가 덮은 구간을 되풀이하고, 오면 빵이 되는 장면으로 넘어간다. */
  isReleased: boolean;
  /** 연기 뒤에서 빵으로 바뀌는 순간(BAKE.swapSec). 이때 상대가 들어선다. */
  onSwap: () => void;
  onComplete: () => void;
}

/**
 * ep5 굽기 연출의 UI 스레드 시계. 줄넘기 로더(use-jump-rope-clock)처럼 모든 움직임을 시계 하나에서
 * 계산한다 — withRepeat 체인을 여러 개 겹쳐 걸지 않는다(인트로 지글거림이 Android 에서 겹친 체인
 * 때문에 죽은 적이 있다).
 *
 * `isPlaying` 이 false 면 처음부터 끝 시각에 둔다 — 연출 없이 1페이지를 그대로 보여 준다. 화면·앱을 벗어나면
 * 줄넘기와 같은 규칙으로 시계를 멈추고, 돌아오면 같은 장면에서 이어 간다.
 *
 * 리포트를 기다리는 동안(`isReleased` false)은 연기가 덮은 구간을 되풀이한다(advanceBakeTime).
 */
export default function useBakeClock({ isPlaying, isReleased, onSwap, onComplete }: UseBakeClockOptions) {
  const time = useSharedValue<number>(isPlaying ? 0 : BAKE.endSec);
  const completed = useSharedValue(!isPlaying);
  const swapped = useSharedValue(!isPlaying);
  const released = useSharedValue(isReleased);
  const control = useRef({ mounted: false, onSwap, onComplete });

  function handleBakeSwap() {
    if (control.current.mounted) {
      control.current.onSwap();
    }
  }

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
    time.value = advanceBakeTime(time.value, delta, released.value);

    if (!swapped.value && hasBakeSwapped(time.value)) {
      swapped.value = true;
      scheduleOnRN(handleBakeSwap);
    }

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
    control.current.onSwap = onSwap;
    control.current.onComplete = onComplete;
  }, [onSwap, onComplete]);

  // 리포트가 오면 UI 스레드 시계가 기다리는 구간을 벗어나게 알린다.
  useEffect(() => {
    released.value = isReleased;
  }, [isReleased, released]);

  useJumpRopePlayback(frame, time, completed, isPlaying);
  return time;
}
