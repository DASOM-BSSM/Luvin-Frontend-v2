import { cssInterop } from 'nativewind';
import type { ReactNode } from 'react';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

const InteropSafeAreaView = cssInterop(SafeAreaView, { className: 'style' });

interface ScreenProps {
  children: ReactNode;
  className?: string;
  /** 먹을 SafeArea 가장자리. 하단 탭바가 아래를 먹는 탭 화면은 ['top'] 만 쓴다. */
  edges?: readonly Edge[];
}

/** 화면 최상위 컨테이너. 상/하단 SafeArea 를 먹고 기본 배경색을 깐다. */
export default function Screen({
  children,
  className = 'flex-1 bg-default-bg',
  edges = ['top', 'bottom'],
}: ScreenProps) {
  return (
    <InteropSafeAreaView className={className} edges={edges}>
      {children}
    </InteropSafeAreaView>
  );
}
