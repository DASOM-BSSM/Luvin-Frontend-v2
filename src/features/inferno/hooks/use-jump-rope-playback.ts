import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { cancelAnimation, type FrameCallback, type SharedValue } from 'react-native-reanimated';

/** 화면·앱을 벗어나면 시계를 멈추고, 돌아오면 같은 장면에서 이어 간다. */
export default function useJumpRopePlayback(
  frame: FrameCallback,
  elapsed: SharedValue<number>,
  completed: SharedValue<boolean>,
  active: boolean,
) {
  const navigation = useNavigation();

  useEffect(() => {
    function handleVisibilityChange() {
      frame.setActive(
        navigation.isFocused() && AppState.currentState === 'active' && !completed.value,
      );
    }

    const unsubscribeFocus = navigation.addListener('focus', handleVisibilityChange);
    const unsubscribeBlur = navigation.addListener('blur', handleVisibilityChange);
    const subscription = AppState.addEventListener('change', handleVisibilityChange);
    handleVisibilityChange();

    return () => {
      frame.setActive(false);
      cancelAnimation(elapsed);
      unsubscribeFocus();
      unsubscribeBlur();
      subscription.remove();
    };
  }, [navigation, frame, elapsed, completed, active]);
}
