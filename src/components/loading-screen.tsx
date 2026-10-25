import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import BreadCharacter from '@/src/assets/images/BreadCharacter';
import ProgressBar from '@/src/components/ui/progress-bar';
import Text from '@/src/components/ui/text';

/** 준비가 끝나기 전까지 막대가 차오르는 지점(%). 끝까지 채우면 다 된 것처럼 보이므로 남겨 둔다. */
const HOLD_PROGRESS = 90;
/** 0 → HOLD_PROGRESS 까지 걸리는 시간. 준비가 이보다 빨라도 이만큼은 보여 줘서 화면이 깜빡이지 않게 한다. */
const HOLD_DURATION_MS = 5750;
/** 준비가 끝난 뒤 HOLD_PROGRESS → 100 을 채우는 시간. */
const FINISH_DURATION_MS = 250;

interface LoadingScreenProps {
  /** 기다리던 작업이 끝났으면 true. 그때부터 막대를 끝까지 채운다. */
  isReady: boolean;
  /** 막대가 100% 까지 찬 뒤 한 번 불린다. */
  onFinish: () => void;
}

/**
 * 앱 시작 로딩 화면. Figma `온보딩-우린`(7895:4654).
 *
 * 앱 시작 때 기다리는 일(로그인 상태 복원)은 진행률을 따로 알려 주지 않는다. 그래서 막대는
 * 정해진 시간 동안 HOLD_PROGRESS 까지 차오른 뒤 준비가 끝나기를 기다리고, 끝나면 마저 채운다.
 * 막대가 다 차야 화면이 넘어가므로, 사용자는 막대만 보고도 언제 끝나는지 알 수 있다.
 */
export default function LoadingScreen({ isReady, onFinish }: LoadingScreenProps) {
  const progress = useSharedValue(0);
  const [hasReachedHold, setHasReachedHold] = useState(false);

  function handleHoldReached() {
    setHasReachedHold(true);
  }

  useEffect(() => {
    progress.value = withTiming(
      HOLD_PROGRESS,
      { duration: HOLD_DURATION_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) scheduleOnRN(handleHoldReached);
      },
    );
  }, [progress]);

  useEffect(() => {
    if (!hasReachedHold || !isReady) return;
    progress.value = withTiming(100, { duration: FINISH_DURATION_MS }, (finished) => {
      if (finished) scheduleOnRN(onFinish);
    });
  }, [hasReachedHold, isReady, onFinish, progress]);

  return (
    <View className="flex-1 items-center justify-center bg-default-bg">
      <View className="items-center gap-[28px]">
        <View className="items-center gap-[4px]">
          <BreadCharacter type="salt" state="baked" className="h-[64.167px] w-[95px]" />
          <Text variant="body-l" className="text-default-black">
            빵이 구워지는 동안만 기다려주세요...
          </Text>
        </View>
        <View className="w-[235px]">
          <ProgressBar progress={progress} />
        </View>
      </View>
    </View>
  );
}
