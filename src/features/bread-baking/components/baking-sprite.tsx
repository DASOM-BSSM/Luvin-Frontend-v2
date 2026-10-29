import { useEffect, useRef } from 'react';
import { PanResponder, type GestureResponderEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import BakingAsset, { type BakingAssetName } from '@/src/assets/images/bread-baking/BakingAsset';
import type { BakingDrop, BakingRect } from '@/src/features/bread-baking/types';
import {
  getFingerPoint, moveDragTouch, startDragTouch, type DragTouch,
} from '@/src/features/bread-baking/utils/drag';
import { BAKING_RULES } from '@/src/features/bread-baking/utils/game';

interface BakingSpriteProps {
  name: BakingAssetName;
  rect: BakingRect;
  label?: string;
  enabled?: boolean;
  onDrop?: (drop: BakingDrop) => void;
  workArea?: BakingRect;
  /** Tool gesture: fires mid-drag once the finger travels `toolTravel` inside `workArea`. */
  onTravel?: () => void;
}

/** GameFrame's positioned-sprite exception: animated geometry comes from Figma slots. */
export default function BakingSprite({
  name, rect, label, enabled = false, onDrop, workArea, onTravel,
}: BakingSpriteProps) {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const dragging = useSharedValue(false);
  const current = useRef({ enabled, onDrop, rect, workArea, onTravel });
  const touch = useRef<DragTouch>(startDragTouch({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }));
  useEffect(() => { current.current = { enabled, onDrop, rect, workArea, onTravel }; },
    [enabled, onDrop, rect, workArea, onTravel]);

  function handleShouldRespond() { return current.current.enabled; }

  function handleGrant(event: GestureResponderEvent) {
    const { locationX, locationY, pageX, pageY } = event.nativeEvent;
    // The sprite fills its slot and is untranslated at grant, so location is slot-relative.
    touch.current = startDragTouch(current.current.rect, { x: locationX, y: locationY },
      { x: pageX, y: pageY });
    dragging.value = true;
    translationX.value = 0;
    translationY.value = 0;
  }

  function handleMove(event: GestureResponderEvent) {
    const { workArea: area, onTravel: travel, enabled: active } = current.current;
    const goal = travel && active ? BAKING_RULES.toolTravel : undefined;
    const next = moveDragTouch(touch.current,
      { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY }, area, goal);
    touch.current = next.touch;
    if (next.touch.settled) {
      // Fired once: snap back and stop following the finger until the next touch.
      if (next.reached) {
        handleCancel();
        travel?.();
      }
      return;
    }
    translationX.value = next.touch.dx;
    translationY.value = next.touch.dy;
  }

  function handleCancel() {
    dragging.value = false;
    translationX.value = withTiming(0);
    translationY.value = withTiming(0);
  }

  function handleRelease(event: GestureResponderEvent) {
    // A tool goal already fired for this touch; its release must not drop again.
    if (touch.current.settled) return;
    // Include the release position even when the host delivers no intermediate move event.
    handleMove(event);
    if (touch.current.settled) return;
    const { onDrop: drop, enabled: active } = current.current;
    if (active) drop?.({ ...getFingerPoint(touch.current), distance: touch.current.distance });
    handleCancel();
  }

  function handleRejectTermination() { return false; }

  // Native responder ownership must survive clock renders for the entire touch.
  // Refs let the stable responder read the latest step without replacing its handlers.
  const responder = useRef<ReturnType<typeof PanResponder.create> | null>(null);
  if (!responder.current) responder.current = PanResponder.create({
    onStartShouldSetPanResponder: handleShouldRespond,
    onMoveShouldSetPanResponder: handleShouldRespond,
    onPanResponderGrant: handleGrant,
    onPanResponderMove: handleMove,
    onPanResponderRelease: handleRelease,
    onPanResponderTerminate: handleCancel,
    onPanResponderTerminationRequest: handleRejectTermination,
  });

  const spriteStyle = useAnimatedStyle(() => ({
    position: 'absolute', left: rect.x, top: rect.y, width: rect.width, height: rect.height,
    zIndex: dragging.value ? 10 : 1,
    transform: [{ translateX: translationX.value }, { translateY: translationY.value }],
  }));

  return (
    <Animated.View {...responder.current.panHandlers} style={spriteStyle}
      pointerEvents={enabled ? 'auto' : 'none'} accessible={Boolean(label)} accessibilityLabel={label}
      accessibilityHint={enabled ? '드래그해서 옮겨주세요' : undefined}
      accessibilityState={{ disabled: !enabled }}>
      <BakingAsset name={name} />
    </Animated.View>
  );
}
