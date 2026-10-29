import { Pressable, View } from 'react-native';

import type { BakingAssetName } from '@/src/assets/images/bread-baking/BakingAsset';
import { bakingLayout } from '@/src/constants/typography';
import BakingOvenGauge from '@/src/features/bread-baking/components/baking-oven-gauge';
import BakingSprite from '@/src/features/bread-baking/components/baking-sprite';
import type { BakingAction, BakingDrop, BakingState } from '@/src/features/bread-baking/types';
import {
  createOvenGreenStart, getOvenProgress, isDropInside,
} from '@/src/features/bread-baking/utils/game';

interface BakingOvenSceneProps {
  state: BakingState;
  enabled: boolean;
  onAction: (action: BakingAction) => void;
}

/** Baked/burnt: Figma 7975:2356. An early pull returns the salted dough from shaping unchanged. */
const RESULT_ASSETS = {
  baked: 'bakedBread', burnt: 'burntBread', raw: 'shapingRollSalted',
} as const satisfies Record<string, BakingAssetName>;

const { oven } = bakingLayout.targets;
// Same positioned-sprite exception as BakingSprite: the tap area is the oven's Figma slot.
const OVEN_PRESS_STYLE = {
  position: 'absolute', left: oven.x, top: oven.y, width: oven.width, height: oven.height,
} as const;

export default function BakingOvenScene({ state, enabled, onAction }: BakingOvenSceneProps) {
  const isBaking = state.step === 'bake';
  const result = state.step === 'serve' ? state.ovenResult : null;
  // Unbaked dough (before baking, or pulled out raw) uses the shaping dough's own slot.
  const isDough = result === null || result === 'raw';

  function handleBreadDrop(drop: BakingDrop) {
    if (state.step === 'load' && isDropInside(drop, oven)) {
      onAction({ type: 'load', greenStart: createOvenGreenStart(Math.random()) });
    }
  }

  function handleOvenPress() {
    onAction({ type: 'remove' });
  }

  // The loaf is inside the oven while baking, so it is hidden; every result lands on the tray.
  // Bake-only images stay mounted from `load` and are only revealed, so they never pop in late.
  const showsBakeImages = state.step === 'load' || isBaking;
  return <>
    <View pointerEvents="none" className={`absolute inset-0 ${isBaking ? 'opacity-0' : ''}`}>
      <BakingSprite name="oven" rect={bakingLayout.slots.oven} />
    </View>
    {showsBakeImages && <View pointerEvents="none"
      className={`absolute inset-0 ${isBaking ? '' : 'opacity-0'}`}>
      <BakingSprite name="litOven" rect={bakingLayout.slots.oven} />
      <BakingOvenGauge greenStart={state.ovenGreenStart}
        progress={getOvenProgress(state.ovenElapsedMs)} />
    </View>}
    <BakingSprite name="tray" rect={bakingLayout.slots.tray} />
    {!isBaking && <BakingSprite key={state.step} name={result ? RESULT_ASSETS[result] : 'shapingRollSalted'}
      rect={isDough ? bakingLayout.slots.trayDough : bakingLayout.slots.saltBread}
      label="반죽을 오븐으로 옮기기"
      enabled={enabled && state.step === 'load'} onDrop={handleBreadDrop} />}
    {isBaking && <Pressable accessibilityRole="button" accessibilityLabel="오븐을 눌러 빵 꺼내기"
      disabled={!enabled} style={OVEN_PRESS_STYLE} onPress={handleOvenPress} />}
  </>;
}
