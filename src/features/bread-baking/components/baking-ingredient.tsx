import { bakingLayout } from '@/src/constants/typography';
import BakingSprite from '@/src/features/bread-baking/components/baking-sprite';
import type { BakingAction, BakingDrop, BakingIngredient } from '@/src/features/bread-baking/types';
import { isDropInside } from '@/src/features/bread-baking/utils/game';

const LABELS: Record<BakingIngredient, string> = {
  flour: '밀가루', eggs: '계란', water: '물', butter: '버터',
  salt: '소금', sugar: '설탕', yeast: '이스트',
};

interface BakingIngredientProps {
  ingredient: BakingIngredient;
  enabled: boolean;
  onAction: (action: BakingAction) => void;
  isFilling?: boolean;
}

export default function BakingIngredient({
  ingredient, enabled, onAction, isFilling = false,
}: BakingIngredientProps) {
  function handleDrop(drop: BakingDrop) {
    const target = isFilling ? bakingLayout.targets.largeBoard : bakingLayout.targets.bowl;
    if (isDropInside(drop, target)) onAction({ type: 'ingredient', ingredient });
  }

  const boardRect = ingredient === 'salt'
    ? bakingLayout.slots.boardSalt : bakingLayout.slots.boardButter;
  const rect = isFilling ? boardRect : bakingLayout.slots[ingredient];
  return <BakingSprite name={ingredient} rect={rect} label={LABELS[ingredient]}
    enabled={enabled} onDrop={handleDrop} />;
}
