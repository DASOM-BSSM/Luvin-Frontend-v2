import type { ReactNode } from 'react';
import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface InfernoEpisodeTapZonesProps {
  /** 왼쪽 절반을 탭했을 때. 넘기지 않으면 왼쪽 탭은 무시한다(상단 "이전화면"이 비활성일 때). */
  onPreviousTap?: () => void;
  /** 오른쪽 절반을 탭했을 때. 넘기지 않으면 오른쪽 탭은 무시한다(상단 "다음화면"이 비활성일 때). */
  onNextTap?: () => void;
  children: ReactNode;
}

/**
 * 본문 영역을 좌우 절반으로 나눠, 왼쪽 탭은 이전 화면 오른쪽 탭은 다음 화면으로 보낸다.
 *
 * 보이는 층을 하나 더 얹지 않고 제스처만 감싼다. 그래서 안쪽 스크롤과 버튼은 그대로 동작한다.
 * 언제 켜지는지는 호출하는 쪽이 정한다 — 두 핸들러가 모두 없으면 탭은 아무 일도 하지 않는다.
 */
export default function InfernoEpisodeTapZones({
  onPreviousTap,
  onNextTap,
  children,
}: InfernoEpisodeTapZonesProps) {
  const [width, setWidth] = useState(0);

  function handleLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  function handleTapEnd(event: { x: number }, success: boolean) {
    if (!success || width === 0) return;
    if (event.x < width / 2) onPreviousTap?.();
    else onNextTap?.();
  }

  const tap = Gesture.Tap().maxDistance(10).runOnJS(true).onEnd(handleTapEnd);

  return (
    <GestureDetector gesture={tap}>
      <View className="flex-1" onLayout={handleLayout}>
        {children}
      </View>
    </GestureDetector>
  );
}
