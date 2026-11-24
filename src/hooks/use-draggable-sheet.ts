import { useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { clampSheetOffset, resolveSheetSnap } from '@/src/lib/sheet-drag';

/** 위로 끝까지 끌었을 때 시트 높이 — 화면 높이의 이 비율. */
const EXPANDED_HEIGHT_RATIO = 0.9;

/** 손을 뗀 뒤 제자리(펼침 · 원래 · 닫힘)로 가는 시간. */
const SNAP_MS = 220;

/**
 * 손잡이로 끄는 시트. 위로 끌면 화면의 90% 높이까지 늘어나고, 아래로 끌어 놓으면 닫힌다.
 *
 * `gesture` 는 손잡이에, `sheetStyle` · `handleSheetLayout` 은 시트에 붙인다.
 * 원래 높이는 늘어나지 않은 동안의 레이아웃으로 잰다(달마다 줄 수가 달라 높이가 바뀐다).
 */
export default function useDraggableSheet(onClose: () => void) {
  const { height: windowHeight } = useWindowDimensions();
  const maxHeight = windowHeight * EXPANDED_HEIGHT_RATIO;
  const offset = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const baseHeight = useSharedValue(0);

  function handleSheetLayout(event: LayoutChangeEvent) {
    if (offset.value <= 0) baseHeight.value = event.nativeEvent.layout.height;
  }

  const gesture = Gesture.Pan()
    .hitSlop({ top: 16, bottom: 16 })
    .onStart(() => {
      'worklet';
      dragStart.value = offset.value;
    })
    .onUpdate((event) => {
      'worklet';
      const maxExpand = maxHeight - baseHeight.value;
      offset.value = clampSheetOffset(dragStart.value - event.translationY, maxExpand, baseHeight.value);
    })
    .onEnd((event) => {
      'worklet';
      const maxExpand = maxHeight - baseHeight.value;
      const snap = resolveSheetSnap(offset.value, event.velocityY, maxExpand, baseHeight.value);

      if (snap === 'closed') {
        offset.value = withTiming(-baseHeight.value, { duration: SNAP_MS }, (finished) => {
          if (finished) scheduleOnRN(onClose);
        });
        return;
      }
      offset.value = withTiming(snap === 'expanded' ? maxExpand : 0, { duration: SNAP_MS });
    });

  // 늘어난 만큼은 최소 높이로, 내려간 만큼은 아래로 옮겨서 그린다.
  const sheetStyle = useAnimatedStyle(() => ({
    minHeight: baseHeight.value > 0 ? baseHeight.value + Math.max(offset.value, 0) : 0,
    transform: [{ translateY: Math.max(-offset.value, 0) }],
  }));

  return { gesture, sheetStyle, handleSheetLayout };
}
