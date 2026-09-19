import { Pressable } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import Text from '@/src/components/ui/text';
import { yellow } from '@/src/constants/colors';

interface EpisodeHistoryRowProps {
  label: string;
  body: string;
  /**
   * 눌림 애니메이션의 기준(비눌림) 배경을 yellow/200 으로 고정할지 여부. 기본값 false —
   * Figma 목업엔 Episode 01 이 항상 노란 배경으로 그려져 있지만, 실제 의도는 "탭 피드백"
   * 이라 특정 회차를 영구적으로 노랗게 칠하지 않는다(제품 결정). 두 로우 모두 기본은
   * 투명이고, 눌리는 동안에만 yellow/200 쪽으로 애니메이션된다.
   */
  highlighted?: boolean;
}

const PRESS_ANIMATION_DURATION_MS = 150;

/**
 * 지난 회차 한 줄. Figma "러빈지옥 에피소드" (6300:7973 / 6300:7990).
 *
 * 배경색은 className 이 아니라 Reanimated `style` 로 애니메이션한다 — 미니게임 씬의
 * LaneSlotView/RailWarningOverlay 와 같은 패턴(AGENTS.md §16 애니메이션 스코프 예외).
 */
export default function EpisodeHistoryRow({ label, body, highlighted = false }: EpisodeHistoryRowProps) {
  const restProgress = highlighted ? 1 : 0;
  const pressProgress = useSharedValue(restProgress);

  function handleRowPressIn() {
    pressProgress.value = withTiming(1, { duration: PRESS_ANIMATION_DURATION_MS });
  }

  function handleRowPressOut() {
    pressProgress.value = withTiming(restProgress, { duration: PRESS_ANIMATION_DURATION_MS });
  }

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(pressProgress.value, [0, 1], ['transparent', yellow[200]]),
  }));

  return (
    <Animated.View className="w-full rounded-[8px] border border-default-gray" style={animatedStyle}>
      <Pressable
        className="w-full flex-col items-start gap-[4px] px-[20px] py-[12px]"
        onPressIn={handleRowPressIn}
        onPressOut={handleRowPressOut}
      >
        <Text variant="body-xxs" className="text-text-primary">
          {label}
        </Text>
        <Text variant="body-s" className="text-text-primary">
          {body}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
