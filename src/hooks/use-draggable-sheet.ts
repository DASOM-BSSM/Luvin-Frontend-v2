import { useEffect } from 'react';
import { useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { clampSheetOffset, resolveSheetSnap } from '@/src/lib/sheet-drag';

/** 위로 끝까지 끌었을 때 시트 높이 — 화면 높이의 이 비율. */
const EXPANDED_HEIGHT_RATIO = 0.9;

/** 손을 뗀 뒤 제자리(펼침 · 원래 · 닫힘)로 가는 시간. */
const SNAP_MS = 220;

/** 열릴 때 시트가 아래에서 올라오는 시간. 배경은 Modal 의 fade 로 제자리에서 어두워진다. */
const SHEET_SLIDE_MS = 250;

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
  /** 1 이면 화면 아래로 완전히 내려간 상태, 0 이면 제자리. */
  const enter = useSharedValue(1);

  // 올라오는 연출은 Reanimated `entering`(SlideInDown) 대신 transform 으로 한다. Android Modal 은
  // 처음에 영역을 상태바만큼 짧게 잡았다가 곧 바로잡는데, `entering` 은 처음 위치를 목적지로 굳혀서
  // 시트가 상태바 높이만큼 바닥에서 뜬 채 멈춘다.
  useEffect(() => {
    enter.value = withTiming(0, { duration: SHEET_SLIDE_MS });
  }, [enter]);

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
    transform: [{ translateY: Math.max(-offset.value, 0) + enter.value * windowHeight }],
  }));

  return { gesture, sheetStyle, handleSheetLayout };
}
