import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { defaultColor, yellow } from '@/src/constants/colors';

const DOT_SIZE = 8;
/** 지금 장의 점은 옆으로 길쭉해진다. */
const ACTIVE_DOT_WIDTH = 22;
const DOT_ANIMATION_MS = 220;

interface DotProps {
  active: boolean;
}

const Dot = ({ active }: DotProps) => {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: DOT_ANIMATION_MS });
    return () => cancelAnimation(progress);
  }, [active, progress]);

  const dotStyle = useAnimatedStyle(() => ({
    width: DOT_SIZE + (ACTIVE_DOT_WIDTH - DOT_SIZE) * progress.value,
    backgroundColor: interpolateColor(progress.value, [0, 1], [defaultColor.gray, yellow[500]]),
  }));

  return <Animated.View className="h-[8px] rounded-full" style={dotStyle} />;
};

interface TourPageDotsProps {
  count: number;
  page: number;
}

/** 투어의 몇 번째 장인지 보여주는 점. */
export default function TourPageDots({ count, page }: TourPageDotsProps) {
  return (
    <View className="flex-row items-center justify-center gap-[6px]">
      {Array.from({ length: count }, (_, index) => (
        <Dot key={index} active={index === page} />
      ))}
    </View>
  );
}
