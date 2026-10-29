import { useEffect, useRef } from 'react';
import { PanResponder, View, type GestureResponderEvent, type PanResponderGestureState } from 'react-native';

import type { BakingDirection, BakingRect } from '@/src/features/bread-baking/types';
import { getSwipeDirection } from '@/src/features/bread-baking/utils/shaping';

interface BakingSwipeAreaProps {
  rect: BakingRect;
  label: string;
  enabled: boolean;
  onSwipe: (direction: BakingDirection) => void;
}

/** One swipe per touch, judged on release. Too-short drags are ignored, not judged. */
export default function BakingSwipeArea({ rect, label, enabled, onSwipe }: BakingSwipeAreaProps) {
  // Same stable-responder pattern as BakingSprite: clock renders must not replace the handlers.
  const current = useRef({ enabled, onSwipe });
  useEffect(() => { current.current = { enabled, onSwipe }; }, [enabled, onSwipe]);

  function handleShouldRespond() { return current.current.enabled; }

  function handleRelease(_event: GestureResponderEvent, gesture: PanResponderGestureState) {
    const direction = getSwipeDirection(gesture.dx, gesture.dy);
    if (direction && current.current.enabled) current.current.onSwipe(direction);
  }

  function handleRejectTermination() { return false; }

  const responder = useRef<ReturnType<typeof PanResponder.create> | null>(null);
  if (!responder.current) responder.current = PanResponder.create({
    onStartShouldSetPanResponder: handleShouldRespond,
    onMoveShouldSetPanResponder: handleShouldRespond,
    onPanResponderRelease: handleRelease,
    onPanResponderTerminationRequest: handleRejectTermination,
  });

  // GameFrame's positioned-sprite exception: the area is the board's slot.
  return <View {...responder.current.panHandlers} accessible accessibilityLabel={label}
    pointerEvents={enabled ? 'auto' : 'none'}
    style={{ position: 'absolute', left: rect.x, top: rect.y, width: rect.width, height: rect.height }} />;
}
