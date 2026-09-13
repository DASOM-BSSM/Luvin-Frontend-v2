import { cssInterop } from 'nativewind';
import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

// react-native-safe-area-context 는 NativeWind 기본 매핑 대상이 아니라서 직접 연결한다.
const InteropSafeAreaView = cssInterop(SafeAreaView, { className: 'style' });

interface ScreenProps {
  children: ReactNode;
  className?: string;
}

/**
 * 화면 최상위 컨테이너. 상/하단 SafeArea 를 먹고 기본 배경색을 깐다.
 *
 * SafeAreaProvider 는 expo-router 가 이미 감싸주므로 따로 두지 않는다.
 */
export default function Screen({
  children,
  className = 'flex-1 bg-default-bg',
}: ScreenProps) {
  return (
    <InteropSafeAreaView className={className} edges={['top', 'bottom']}>
      {children}
    </InteropSafeAreaView>
  );
}
