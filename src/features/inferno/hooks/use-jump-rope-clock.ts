import { useLayoutEffect, useRef } from 'react';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { JUMP_ROPE } from '@/src/features/inferno/constants/jump-rope';
import useJumpRopePlayback from '@/src/features/inferno/hooks/use-jump-rope-playback';
import { getNextOverheadTime } from '@/src/features/inferno/utils/jump-rope-timing';

/** 잠깐의 프레임 지연으로 점프·퇴장 연출 전체를 건너뛰지 않도록 한다. */
const MAX_FRAME_SEC = 1 / 15;

/** 모든 움직임과 퇴장을 하나의 UI 스레드 시계에서 계산한다. 별도 타이머는 없다. */
export default function useJumpRopeClock(active: boolean, onExitComplete: () => void) {
  const elapsed = useSharedValue(0);
  const exitAt = useSharedValue(Infinity);
  const requested = useSharedValue(active);
  const completed = useSharedValue(false);
  const generation = useSharedValue(0);
  const control = useRef({ mounted: false, active, generation: 0, onExitComplete });

  function handleAnimationExit(finishedGeneration: number) {
    const current = control.current;
    if (!current.mounted || current.active || current.generation !== finishedGeneration) {
      return;
    }
    frame.setActive(false);
    current.onExitComplete();
  }

  const frame = useFrameCallback(({ timeSincePreviousFrame }) => {
    if (completed.value) return;

    const next = elapsed.value + Math.min((timeSincePreviousFrame ?? 0) / 1000, MAX_FRAME_SEC);
    elapsed.value = next;

    if (!requested.value && exitAt.value === Infinity) {
      exitAt.value = getNextOverheadTime(next);
    }

    if (next >= exitAt.value + JUMP_ROPE.fadeSec) {
      completed.value = true;
      scheduleOnRN(handleAnimationExit, generation.value);
    }
  }, false);

  useLayoutEffect(() => {
    control.current.mounted = true;
    return () => {
      control.current.mounted = false;
    };
  }, []);

  useLayoutEffect(() => {
    // 퇴장 도중 새 요청이 시작되면 지난 요청의 완료 콜백을 무효화한다.
    if (active && !control.current.active) {
      control.current.generation += 1;
      generation.value = control.current.generation;
      elapsed.value = 0;
      exitAt.value = Infinity;
      completed.value = false;
    }
    control.current.active = active;
    control.current.onExitComplete = onExitComplete;
    requested.value = active;
  }, [active, onExitComplete, requested, elapsed, exitAt, completed, generation]);

  useJumpRopePlayback(frame, elapsed, completed, active);
  return { elapsed, exitAt };
}
