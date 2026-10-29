import type { BakingAssetName } from '@/src/assets/images/bread-baking/BakingAsset';
import { bakingLayout } from '@/src/constants/typography';
import BakingIngredient from '@/src/features/bread-baking/components/baking-ingredient';
import BakingSprite from '@/src/features/bread-baking/components/baking-sprite';
import type {
  BakingAction, BakingDrop, BakingIngredient as Ingredient, BakingState, BakingStep,
} from '@/src/features/bread-baking/types';
import { getExpectedIngredient, isDropInside, isMixingStep } from '@/src/features/bread-baking/utils/game';

interface BakingMixingSceneProps {
  state: BakingState;
  enabled: boolean;
  onAction: (action: BakingAction) => void;
}

const DOUGH_STEPS: readonly BakingStep[] = [
  'butter', 'water', 'mix-second', 'salt', 'sugar', 'yeast', 'mix-final', 'transfer',
];

const INGREDIENTS: readonly Ingredient[] = ['flour', 'eggs', 'butter', 'water', 'salt', 'sugar', 'yeast'];

/** One whole-bowl image per step, so contents always match the bowl (GPT prompts 12–15). */
const BOWL_ASSETS: Partial<Record<BakingStep, BakingAssetName>> = {
  eggs: 'flourBowl',
  'mix-first': 'flourEggBowl',
  water: 'doughButterBowl',
  'mix-second': 'doughButterWaterBowl',
};

function getBowlAsset(step: BakingStep): BakingAssetName {
  return BOWL_ASSETS[step] ?? (DOUGH_STEPS.includes(step) ? 'doughBowl' : 'emptyBowl');
}

export default function BakingMixingScene({ state, enabled, onAction }: BakingMixingSceneProps) {
  const { step } = state;
  const isTransfer = step === 'transfer';
  const hasDough = DOUGH_STEPS.includes(step);

  function handleBowlDrop(drop: BakingDrop) {
    if (step === 'prepare' && isDropInside(drop, bakingLayout.targets.bowl)) {
      onAction({ type: 'prepare' });
    } else if (isTransfer && isDropInside(drop, bakingLayout.targets.board)) {
      onAction({ type: 'transfer' });
    }
  }

  // Fires mid-drag once the finger has stirred `toolTravel` inside the bowl (no release needed).
  function handleWhiskTravel() {
    onAction({ type: 'mix' });
  }

  function renderIngredient(ingredient: Ingredient) {
    return <BakingIngredient key={ingredient} ingredient={ingredient}
      enabled={enabled && getExpectedIngredient(step) === ingredient} onAction={onAction} />;
  }

  return <>
    {INGREDIENTS.map(renderIngredient)}
    {isTransfer && <BakingSprite name="board" rect={bakingLayout.slots.board} />}
    <BakingSprite name={getBowlAsset(step)}
      rect={hasDough ? bakingLayout.slots.doughBowl : bakingLayout.slots.emptyBowl}
      label={isTransfer ? '반죽을 도마로 옮기기' : '빈 그릇 준비하기'}
      enabled={enabled && (step === 'prepare' || isTransfer)} onDrop={handleBowlDrop} />
    <BakingSprite name="whisk" rect={bakingLayout.slots.whisk} label="거품기로 섞기"
      workArea={bakingLayout.targets.bowl}
      enabled={enabled && isMixingStep(step)} onTravel={handleWhiskTravel} />
  </>;
}
