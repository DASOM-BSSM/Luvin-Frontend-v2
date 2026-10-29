import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';

const InteropImage = cssInterop(Image, { className: 'style' });

/** Individual Figma exports, including crop/rotation and salt/sugar/yeast lettering. */
const SOURCES = {
  flour: require('@/src/assets/images/bread-baking/flour.png'),
  eggs: require('@/src/assets/images/bread-baking/eggs.png'),
  butter: require('@/src/assets/images/bread-baking/butter.png'),
  water: require('@/src/assets/images/bread-baking/water.png'),
  salt: require('@/src/assets/images/bread-baking/salt.png'),
  sugar: require('@/src/assets/images/bread-baking/sugar.png'),
  yeast: require('@/src/assets/images/bread-baking/yeast.png'),
  whisk: require('@/src/assets/images/bread-baking/whisk.png'),
  emptyBowl: require('@/src/assets/images/bread-baking/empty-bowl.png'),
  doughBowl: require('@/src/assets/images/bread-baking/dough-bowl.png'),
  board: require('@/src/assets/images/bread-baking/board.png'),
  dough: require('@/src/assets/images/bread-baking/dough.png'),
  flatDough: require('@/src/assets/images/bread-baking/flat-dough.png'),
  rollingPin: require('@/src/assets/images/bread-baking/rolling-pin.png'),
  oven: require('@/src/assets/images/bread-baking/oven.png'),
  litOven: require('@/src/assets/images/bread-baking/lit-oven.png'),
  tray: require('@/src/assets/images/bread-baking/tray.png'),
  saltBread: require('@/src/assets/images/bread-baking/salt-bread.png'),
  bakedBread: require('@/src/assets/images/bread-baking/baked-bread.png'),
  burntBread: require('@/src/assets/images/bread-baking/burnt-bread.png'),
  egg: require('@/src/assets/images/bread-baking/egg.png'),
  // GPT-made bowls with their contents (prompts 12–15), same 147x124 canvas as the empty bowl.
  flourBowl: require('@/src/assets/images/bread-baking/flour-bowl.png'),
  flourEggBowl: require('@/src/assets/images/bread-baking/flour-egg-bowl.png'),
  doughButterBowl: require('@/src/assets/images/bread-baking/dough-butter-bowl.png'),
  doughButterWaterBowl: require('@/src/assets/images/bread-baking/dough-butter-water-bowl.png'),
  // GPT-made for the oven gauge (docs/bread-baking-gpt-prompts.md 10–11), cropped to content.
  timerFrame: require('@/src/assets/images/bread-baking/timer-frame.png'),
  timerMarker: require('@/src/assets/images/bread-baking/timer-marker.png'),
  // GPT-made shaping set (prompts 1–9); dough images share one crop so stages line up.
  largeBoard: require('@/src/assets/images/bread-baking/large-board.png'),
  shapingRoundDough: require('@/src/assets/images/bread-baking/shaping-round-dough.png'),
  shapingFlatDough: require('@/src/assets/images/bread-baking/shaping-flat-dough.png'),
  shapingRollStart: require('@/src/assets/images/bread-baking/shaping-roll-start.png'),
  shapingRollHalf: require('@/src/assets/images/bread-baking/shaping-roll-half.png'),
  shapingRollNearlyDone: require('@/src/assets/images/bread-baking/shaping-roll-nearly-done.png'),
  shapingRollComplete: require('@/src/assets/images/bread-baking/shaping-roll-complete.png'),
  shapingRollSalted: require('@/src/assets/images/bread-baking/shaping-roll-salted.png'),
  shapingArrow: require('@/src/assets/images/bread-baking/shaping-arrow-right.png'),
};

export type BakingAssetName = keyof typeof SOURCES;

interface BakingAssetProps {
  name: BakingAssetName;
  onLoad?: () => void;
  onError?: () => void;
}

export default function BakingAsset({ name, onLoad, onError }: BakingAssetProps) {
  return <InteropImage source={SOURCES[name]} contentFit="contain" className="h-full w-full"
    onLoad={onLoad} onError={onError} accessible={false} />;
}
