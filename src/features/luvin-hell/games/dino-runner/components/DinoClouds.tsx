import { View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import CloudLargeIcon from '@/src/assets/icons/CloudLargeIcon';
import CloudMediumIcon from '@/src/assets/icons/CloudMediumIcon';
import CloudSmallIcon from '@/src/assets/icons/CloudSmallIcon';
import {
  CLOUD_PARALLAX_RATIO,
  FRAME_WIDTH,
} from '@/src/features/luvin-hell/games/dino-runner/engine/constants';

interface DinoCloudsProps {
  /** 누적 생존거리(px). 구름은 여기에 `CLOUD_PARALLAX_RATIO`를 곱한 만큼만 흘러 멀리 있는 것처럼 보인다. */
  distance: SharedValue<number>;
}

/** Figma 미니게임1(`5913:5154`)의 구름 3개 한 벌. 프레임 폭 안에 다 들어가서 두 벌을 이어 붙이면 끊김 없이 반복된다. */
const CloudTile = ({ offset }: { offset: number }) => (
  <>
    <View className="absolute top-[99px]" style={{ left: offset + 37 }}>
      <CloudMediumIcon />
    </View>
    <View className="absolute top-[129px]" style={{ left: offset + 226 }}>
      <CloudLargeIcon />
    </View>
    <View className="absolute top-[164px]" style={{ left: offset + 100 }}>
      <CloudSmallIcon />
    </View>
  </>
);

/** 공룡빵게임 플레이필드의 구름 층. 달리는 동안 땅보다 느리게 왼쪽으로 흐른다(시차). */
export default function DinoClouds({ distance }: DinoCloudsProps) {
  // 움직이는 요소는 className 없이 style 만 쓴다(PlayerSprite 주석 참고).
  const scrollStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -((distance.value * CLOUD_PARALLAX_RATIO) % FRAME_WIDTH) }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, width: FRAME_WIDTH * 2 }, scrollStyle]}
    >
      <CloudTile offset={0} />
      <CloudTile offset={FRAME_WIDTH} />
    </Animated.View>
  );
}
