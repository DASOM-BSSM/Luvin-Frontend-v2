import type { ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';

interface LandscapeOnlyProps {
  children: ReactNode;
}

/**
 * 가로 전용 화면(러빈지옥)을 세로 상태일 때는 감춘다.
 *
 * 화면 방향은 경로를 보고 바뀐다(use-landscape-routes). 그래서 에피소드를 끝내고 홈으로
 * 나가면 경로가 먼저 `/` 로 바뀌어 세로 회전이 시작되는데, 그 순간에도 에피소드 화면은 아직
 * 빠져나가는 중이라 세로 크기로 다시 그려진 깨진 레이아웃이 그대로 보였다(사용자 지적).
 * 들어올 때도 가로로 눕기 직전 한 순간 세로로 그려진다.
 *
 * 창이 세로(높이 > 폭)인 동안은 내용을 투명하게 감추고 터치도 막는다. 지우지 않고 감추기만
 * 하므로(opacity) 진행 상태는 그대로 남는다.
 */
export default function LandscapeOnly({ children }: LandscapeOnlyProps) {
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;

  return (
    <View className={`flex-1 ${isPortrait ? 'opacity-0' : ''}`} pointerEvents={isPortrait ? 'none' : 'auto'}>
      {children}
    </View>
  );
}
