import { useState } from 'react';
import { View, type AccessibilityActionEvent, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

import SliderMarks, {
  SLIDER_SIDE_OVERFLOW,
  SLIDER_THUMB_SIZE,
  type SliderMark,
} from '@/src/components/ui/slider-marks';
import { clampPosition, positionFromX, snapPosition, stepToPoint } from '@/src/lib/slider-math';

/** 눈금에서 이 거리(0~1 위치 기준) 안이면 눈금으로 끌려간다. 트랙 폭의 4% 쯤이다. */
const SNAP_THRESHOLD = 0.04;

const ACCESSIBILITY_ACTIONS = [{ name: 'increment' }, { name: 'decrement' }];

interface SliderProps {
  /** 0~1. */
  value: number;
  onChange: (position: number) => void;
  /** 손가락을 떼면 한 번 불린다. 놓은 자리를 확정할 때 쓴다. */
  onChangeEnd?: () => void;
  /** 눈금(스냅 지점). 가까이 가면 손잡이가 눈금에 달라붙고, 라벨이 아래에 붙는다. */
  marks: readonly SliderMark[];
  accessibilityLabel: string;
  /** 스크린리더가 읽을 현재 값. */
  accessibilityValueText: string;
}

/**
 * 눈금에 자석처럼 달라붙는 가로 슬라이더. Figma 시안이 없어 마이페이지 토글처럼 토큰 색만 입혔다.
 *
 * 값은 위로 올려 보내는 통제형이다. 눈금 사이는 연속으로 움직이고, 눈금 근처에서만 달라붙는다.
 * 트랙을 누르기만 해도 그 자리로 건너뛴다. 스크린리더는 증가/감소 동작으로 눈금을 하나씩 옮긴다.
 *
 * 손잡이 앞 막대의 폭은 값에서 나오는 동적 값이라 style 로 준다(ProgressBar 와 같은 §16 예외).
 */
export default function Slider({
  value,
  onChange,
  onChangeEnd,
  marks,
  accessibilityLabel,
  accessibilityValueText,
}: SliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const positions = marks.map((mark) => mark.position);
  const travel = Math.max(0, trackWidth - SLIDER_THUMB_SIZE);
  const activePosition = positions.find((position) => Math.abs(position - value) < 0.0005);

  function handleTrackLayout(event: LayoutChangeEvent) {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  function handleTouchMove(x: number) {
    const raw = positionFromX(x, trackWidth, SLIDER_THUMB_SIZE);

    onChange(snapPosition(raw, positions, SNAP_THRESHOLD));
  }

  function handleTouchEnd() {
    onChangeEnd?.();
  }

  function handleAccessibilityAction(event: AccessibilityActionEvent) {
    const direction = event.nativeEvent.actionName === 'increment' ? 1 : -1;

    onChange(stepToPoint(value, positions, direction));
    onChangeEnd?.();
  }

  const gesture = Gesture.Pan()
    .minDistance(0)
    .onBegin((event) => {
      'worklet';
      scheduleOnRN(handleTouchMove, event.x);
    })
    .onUpdate((event) => {
      'worklet';
      scheduleOnRN(handleTouchMove, event.x);
    })
    .onFinalize(() => {
      'worklet';
      scheduleOnRN(handleTouchEnd);
    });

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: accessibilityValueText }}
      accessibilityActions={ACCESSIBILITY_ACTIONS}
      onAccessibilityAction={handleAccessibilityAction}
      className="w-full flex-col gap-[4px]"
      style={{ paddingHorizontal: SLIDER_SIDE_OVERFLOW }}
    >
      <GestureDetector gesture={gesture}>
        <View className="h-[40px] w-full flex-row items-center" onLayout={handleTrackLayout}>
          <View
            className="h-[8px] rounded-l-full bg-pink-400"
            style={{ width: clampPosition(value) * travel }}
          />
          <View className="size-[28px] rounded-full bg-pink-500" />
          <View className="h-[8px] flex-1 rounded-r-full bg-pink-200" />
        </View>
      </GestureDetector>
      <SliderMarks marks={marks} trackWidth={trackWidth} activePosition={activePosition} />
    </View>
  );
}
