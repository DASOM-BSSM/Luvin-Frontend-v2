import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { jumpRopeLayout } from '@/src/constants/typography';
import BreadJumpRope from '@/src/features/inferno/components/bread-jump-rope';
import BreadJumpRopeHolder from '@/src/features/inferno/components/bread-jump-rope-holder';
import BreadJumpRopeJumper from '@/src/features/inferno/components/bread-jump-rope-jumper';
import BreadJumpRopeMessage from '@/src/features/inferno/components/bread-jump-rope-message';
import { JUMP_ROPE } from '@/src/features/inferno/constants/jump-rope';

const SLOTS = Array.from({ length: JUMP_ROPE.slotCount }, (_, slot) => slot);

interface BreadJumpRopeStageProps {
  elapsed: SharedValue<number>;
  exitAt: SharedValue<number>;
}

interface StageSize {
  width: number;
  height: number;
}

/**
 * 쪽지 안을 채우는 줄넘기 장면. Figma 7219:3595 의 쪽지(781x300) 좌표를 실제 크기에 맞춰
 * 비율로 줄이고 가운데에 놓는다. 네 슬롯은 로딩 세션 내내 마운트해 둔다.
 */
export default function BreadJumpRopeStage({ elapsed, exitAt }: BreadJumpRopeStageProps) {
  const [size, setSize] = useState<StageSize>({
    width: jumpRopeLayout.width,
    height: jumpRopeLayout.height,
  });
  const scale = Math.min(size.width / jumpRopeLayout.width, size.height / jumpRopeLayout.height);
  const sceneStyle = {
    left: (size.width - jumpRopeLayout.width * scale) / 2,
    top: (size.height - jumpRopeLayout.height * scale) / 2,
    width: jumpRopeLayout.width * scale,
    height: jumpRopeLayout.height * scale,
  };
  const messageStyle = { top: jumpRopeLayout.messageTop * scale };

  function handleStageLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  }

  function renderJumper(slot: number) {
    return (
      <BreadJumpRopeJumper
        key={slot}
        slot={slot}
        scale={scale}
        elapsed={elapsed}
        exitAt={exitAt}
      />
    );
  }

  return (
    <View className="flex-1" onLayout={handleStageLayout} pointerEvents="none">
      <View className="absolute" style={sceneStyle}>
        <View className="absolute left-0 right-0 items-center" style={messageStyle}>
          <BreadJumpRopeMessage />
        </View>
        <View
          className="absolute inset-0"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <BreadJumpRope front={false} scale={scale} elapsed={elapsed} />
          <BreadJumpRopeHolder side="left" scale={scale} elapsed={elapsed} />
          <BreadJumpRopeHolder side="right" scale={scale} elapsed={elapsed} />
          {SLOTS.map(renderJumper)}
          <BreadJumpRope front scale={scale} elapsed={elapsed} />
        </View>
      </View>
    </View>
  );
}
