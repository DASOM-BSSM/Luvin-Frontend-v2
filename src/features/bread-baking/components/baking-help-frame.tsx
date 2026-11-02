import { View } from 'react-native';

import PlayerAvatar from '@/src/assets/images/PlayerAvatar';
import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { miniGameCounterStyle } from '@/src/constants/typography';
import BakingMixingScene from '@/src/features/bread-baking/components/baking-mixing-scene';
import BakingOvenScene from '@/src/features/bread-baking/components/baking-oven-scene';
import BakingShapingScene from '@/src/features/bread-baking/components/baking-shaping-scene';
import type { BakingHelpPage } from '@/src/features/bread-baking/constants/help';
import type { BakingState } from '@/src/features/bread-baking/types';
import { BAKING_RULES, createBakingState, formatBakingTime } from '@/src/features/bread-baking/utils/game';
import GameFrame from '@/src/features/luvin-hell/components/GameFrame';

interface BakingHelpFrameProps {
  page: BakingHelpPage;
  /** Omitted on the last page, which has no "다음 설명" button in Figma. */
  onNext?: () => void;
}

const SHAPING_STEPS = ['roll', 'filling', 'shape', 'sprinkle'];
const OVEN_STEPS = ['load', 'bake', 'serve'];

function createSceneState(page: BakingHelpPage): BakingState {
  return { ...createBakingState(), phase: 'playing', step: page.step };
}

// The scenes are drawn only as a picture here: every sprite is disabled, so no action arrives.
function handleSceneAction() {}

/** One page of the bread-baking help: the real scene, dimmed, with Dasom's bubbles on top. */
export default function BakingHelpFrame({ page, onNext }: BakingHelpFrameProps) {
  const state = createSceneState(page);
  const Scene = SHAPING_STEPS.includes(page.step) ? BakingShapingScene
    : OVEN_STEPS.includes(page.step) ? BakingOvenScene : BakingMixingScene;

  return (
    <GameFrame heightClassName="h-baking-frame">
      <View className="flex-1 bg-pink-100">
        <Scene state={state} enabled={false} onAction={handleSceneAction} />
        <View className="absolute right-[18px] top-[18px]">
          <Text className="text-pink-500" style={miniGameCounterStyle}>
            {formatBakingTime(BAKING_RULES.durationMs)}
          </Text>
        </View>
        <View className="absolute inset-0 z-20 bg-default-black/50">
          <View className={`absolute left-[93px] top-[306px] gap-[8px] ${page.bubbleWidthClass}`}>
            {page.bubbles.map((bubble) => (
              <View key={bubble}
                className="w-full rounded-tl-[20px] rounded-tr-[20px] rounded-br-[20px] bg-yellow-200 px-[20px] py-[10px]">
                <Text variant="body-s" className="text-text-primary">{bubble}</Text>
              </View>
            ))}
          </View>
          <View className="absolute left-[28px] top-[324px] h-[118px] w-[53px]">
            <PlayerAvatar facing="front" className="h-full w-full" />
          </View>
          {onNext && (
            // Figma 18pt from the frame's bottom-right; anchored there since this frame is shorter.
            <View className="absolute bottom-[18px] right-[18px]">
              <Button label="다음 설명" variant="outline" onPress={onNext} />
            </View>
          )}
        </View>
      </View>
    </GameFrame>
  );
}
