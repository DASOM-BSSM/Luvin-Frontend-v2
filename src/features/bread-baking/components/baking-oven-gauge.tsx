import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import BakingAsset from '@/src/assets/images/bread-baking/BakingAsset';
import { bakingLayout } from '@/src/constants/typography';
import type { BakingOvenZone, BakingRect } from '@/src/features/bread-baking/types';
import { BAKING_RULES, getOvenGaugeZones } from '@/src/features/bread-baking/utils/game';

interface BakingOvenGaugeProps {
  greenStart: number;
  /** 0–1 position of the marker along the track. */
  progress: number;
}

const { timerFrame, timerTrack, timerMarker } = bakingLayout.slots;

const ZONE_CLASSES = {
  red: 'bg-state-error', orange: 'bg-state-warning', green: 'bg-state-success',
} as const satisfies Record<BakingOvenZone['kind'], string>;

// Same positioned-sprite exception as BakingSprite: geometry comes from bakingLayout slots.
function toRectStyle({ x, y, width, height }: BakingRect) {
  return { position: 'absolute', left: x, top: y, width, height } as const;
}

/** The frame's track is transparent, so the per-try zones are painted underneath it. */
export default function BakingOvenGauge({ greenStart, progress }: BakingOvenGaugeProps) {
  const offset = useSharedValue(progress);

  // Ticks arrive every `tickMs`; easing across one tick keeps the marker gliding.
  useEffect(() => {
    offset.value = withTiming(progress, { duration: BAKING_RULES.tickMs, easing: Easing.linear });
  }, [offset, progress]);

  const markerStyle = useAnimatedStyle(() => ({
    position: 'absolute', top: timerMarker.y, width: timerMarker.width,
    height: timerMarker.height,
    left: timerTrack.x + offset.value * timerTrack.width - timerMarker.width / 2,
  }));

  return <>
    <View pointerEvents="none" className="flex-row overflow-hidden rounded"
      style={toRectStyle(timerTrack)}>
      {getOvenGaugeZones(greenStart).map((zone, index) => (
        <View key={index} className={ZONE_CLASSES[zone.kind]} style={{ flex: zone.size }} />
      ))}
    </View>
    <View pointerEvents="none" style={toRectStyle(timerFrame)}><BakingAsset name="timerFrame" /></View>
    <Animated.View pointerEvents="none" style={markerStyle}><BakingAsset name="timerMarker" /></Animated.View>
  </>;
}
