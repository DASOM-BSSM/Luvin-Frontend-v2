import { View } from 'react-native';

import BakingAsset, { type BakingAssetName } from '@/src/assets/images/bread-baking/BakingAsset';
import { bakingLayout } from '@/src/constants/typography';
import BakingIngredient from '@/src/features/bread-baking/components/baking-ingredient';
import BakingSprite from '@/src/features/bread-baking/components/baking-sprite';
import BakingSwipeArea from '@/src/features/bread-baking/components/baking-swipe-area';
import type {
  BakingAction, BakingDirection, BakingState,
} from '@/src/features/bread-baking/types';
import { createShapeArrows } from '@/src/features/bread-baking/utils/shaping';

interface BakingShapingSceneProps {
  state: BakingState;
  enabled: boolean;
  onAction: (action: BakingAction) => void;
}

/** Each hit rolls the dough one stage further, whatever its direction (user-approved). */
const SHAPE_STAGES = [
  'shapingRollStart', 'shapingRollHalf', 'shapingRollNearlyDone', 'shapingRollComplete',
] as const satisfies readonly BakingAssetName[];

/**
 * The arrow asset points right; the other directions rotate it. Rotation goes through `style`,
 * not a `rotate-*` class: toggling transform classes made NativeWind swap the component
 * mid-render, which threw "Couldn't find a navigation context" on iOS.
 */
const ARROW_ROTATIONS: Record<BakingDirection, string> = {
  right: '0deg', down: '90deg', left: '180deg', up: '-90deg',
};

const { shapeArrow } = bakingLayout.slots;
// Same positioned-sprite exception as BakingSprite: geometry comes from the slot.
const ARROW_STYLE = {
  position: 'absolute', left: shapeArrow.x, top: shapeArrow.y,
  width: shapeArrow.width, height: shapeArrow.height,
} as const;

function getDoughAsset({ step, shaping }: BakingState): BakingAssetName {
  if (step === 'roll') return 'shapingRoundDough';
  if (step === 'filling') return 'shapingFlatDough';
  if (step === 'shape') return SHAPE_STAGES[Math.min(shaping.hits, SHAPE_STAGES.length - 1)];
  return 'shapingRollComplete';
}

export default function BakingShapingScene({ state, enabled, onAction }: BakingShapingSceneProps) {
  const { step, shaping } = state;
  const arrow = step === 'shape' && !shaping.failed ? shaping.arrows[shaping.index] : undefined;

  // Tool gestures fire mid-drag once the finger travels `toolTravel` on the board.
  function handleRollTravel() {
    onAction({ type: 'roll' });
  }

  // The butter drop starts shaping, so it brings the first arrows along.
  function handleFillingAction(action: BakingAction) {
    onAction(action.type === 'ingredient'
      ? { ...action, arrows: createShapeArrows(Math.random) } : action);
  }

  function handleSwipe(direction: BakingDirection) {
    onAction({ type: 'swipe', direction });
  }

  return <>
    <BakingSprite name="largeBoard" rect={bakingLayout.slots.largeBoard} />
    <BakingSprite name={getDoughAsset(state)} rect={bakingLayout.slots.boardDough} />
    {(step === 'roll' || step === 'filling') && <BakingIngredient ingredient="butter" isFilling
      enabled={enabled && step === 'filling'} onAction={handleFillingAction} />}
    <BakingIngredient ingredient="salt" isFilling enabled={enabled && step === 'sprinkle'}
      onAction={onAction} />
    <BakingSprite name="rollingPin" rect={bakingLayout.slots.rollingPin}
      workArea={bakingLayout.targets.largeBoard}
      label="밀대로 반죽 밀기" enabled={enabled && step === 'roll'} onTravel={handleRollTravel} />
    {arrow && <View pointerEvents="none"
      style={[ARROW_STYLE, { transform: [{ rotate: ARROW_ROTATIONS[arrow] }] }]}>
      <BakingAsset name="shapingArrow" />
    </View>}
    {step === 'shape' && <BakingSwipeArea rect={bakingLayout.targets.largeBoard}
      label="화살표 방향으로 반죽 드래그하기" enabled={enabled} onSwipe={handleSwipe} />}
  </>;
}
