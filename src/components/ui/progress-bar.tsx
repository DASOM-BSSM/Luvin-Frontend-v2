import { View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

interface ProgressBarProps {
  /** 0~100. 매 프레임 바뀌는 값이라 숫자 대신 SharedValue 로 받는다. */
  progress: SharedValue<number>;
}

/**
 * 라벨 없는 둥근 진행 막대. Figma 로딩 화면(7895:4896)의 막대 — 트랙 `pink-200`, 채움
 * `pink-400`, 높이 11.
 *
 * 폭(%)은 매 프레임 새로 정해지는 값이라 Tailwind 클래스로 표현할 수 없어 style 로 준다 —
 * StatBar 와 같은 이유의, 동적 값에 대한 §16 예외다.
 */
export default function ProgressBar({ progress }: ProgressBarProps) {
  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, Math.max(0, progress.value))}%`,
  }));

  return (
    <View className="h-[11px] w-full overflow-hidden rounded-full bg-pink-200">
      <Animated.View className="h-full rounded-full bg-pink-400" style={fillStyle} />
    </View>
  );
}
