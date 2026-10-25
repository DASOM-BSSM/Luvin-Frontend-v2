import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Text from '@/src/components/ui/text';

/** 글자 하나씩 튀어 들어오는 간격. */
const CHAR_STAGGER_MS = 70;

/** 아래에서 튀어 올라오는 거리(px). */
const ENTER_DISTANCE = 18;

/** 다 들어온 뒤 제목 전체가 파도처럼 한 번씩 출렁이는 높이(px). */
const WAVE_HEIGHT = 6;

const WAVE_UP_MS = 160;
const WAVE_DOWN_MS = 220;

/** 파도 한 번이 끝나고 다음 파도까지 쉬는 시간. 계속 출렁이면 정신없다. */
const WAVE_REST_MS = 2600;

/** 들어오는 스프링. 살짝 넘쳤다가 자리 잡는다. */
const ENTER_SPRING = { damping: 9, stiffness: 200, mass: 0.7 };

interface WaveCharProps {
  char: string;
  index: number;
  count: number;
}

const WaveChar = ({ char, index, count }: WaveCharProps) => {
  const enter = useSharedValue(0);
  const wave = useSharedValue(0);

  useEffect(() => {
    enter.value = withDelay(index * CHAR_STAGGER_MS, withSpring(1, ENTER_SPRING));

    // 첫 파도는 마지막 글자가 다 들어온 뒤에 시작한다. 글자마다 시작을 조금씩 늦춰 왼쪽에서
    // 오른쪽으로 물결이 지나가게 하고, 주기는 모두 같게 둬서 계속 같은 모양을 유지한다.
    const waveCycleMs = WAVE_UP_MS + WAVE_DOWN_MS + WAVE_REST_MS;
    wave.value = withDelay(
      count * CHAR_STAGGER_MS + 900 + index * CHAR_STAGGER_MS,
      withRepeat(
        withSequence(
          withTiming(1, { duration: WAVE_UP_MS, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: WAVE_DOWN_MS, easing: Easing.in(Easing.quad) }),
          withDelay(waveCycleMs - WAVE_UP_MS - WAVE_DOWN_MS, withTiming(0, { duration: 0 })),
        ),
        -1,
        false,
      ),
    );

    // 정리 없이 새 체인을 얹으면 Android 에서 공유 값이 꼬인 적이 있다(러빈지옥 인트로).
    return () => {
      cancelAnimation(enter);
      cancelAnimation(wave);
    };
  }, [index, count, enter, wave]);

  const charStyle = useAnimatedStyle(() => ({
    opacity: Math.min(enter.value * 1.5, 1),
    transform: [
      { translateY: (1 - enter.value) * ENTER_DISTANCE - wave.value * WAVE_HEIGHT },
      { scale: 0.6 + enter.value * 0.4 },
    ],
  }));

  return (
    <Animated.View style={charStyle}>
      <Text variant="heading-h2" className="text-default-black">
        {char}
      </Text>
    </Animated.View>
  );
};

interface WelcomeTitleProps {
  title: string;
}

/**
 * 환영 화면 제목. 글자가 하나씩 통통 튀어 들어온 뒤, 이따금 물결처럼 한 번씩 출렁인다.
 *
 * 글자마다 따로 움직여야 해서 한 글자씩 쪼개 가로로 늘어놓는다. 제목이 짧아(닉네임 + 인사)
 * 줄바꿈은 flex-wrap 에 맡긴다.
 */
export default function WelcomeTitle({ title }: WelcomeTitleProps) {
  const chars = Array.from(title);

  return (
    <View accessible accessibilityRole="header" accessibilityLabel={title} className="flex-row flex-wrap justify-center">
      {chars.map((char, index) => (
        <WaveChar key={`${index}-${char}`} char={char} index={index} count={chars.length} />
      ))}
    </View>
  );
}
