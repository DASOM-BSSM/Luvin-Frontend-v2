import type { ReactNode } from 'react';
import { useRef } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { View } from 'react-native';

/** 이만큼 넘게 움직이고 뗀 터치는 탭이 아니라 드래그로 보고 무시한다(px). */
const TAP_MAX_MOVE = 10;

interface InfernoEpisodeTapZonesProps {
  /** 왼쪽 절반을 탭했을 때. 넘기지 않으면 왼쪽 탭은 무시한다(상단 "이전화면"이 비활성일 때). */
  onPreviousTap?: () => void;
  /** 오른쪽 절반을 탭했을 때. 넘기지 않으면 오른쪽 탭은 무시한다(상단 "다음화면"이 비활성일 때). */
  onNextTap?: () => void;
  children: ReactNode;
}

/**
 * 본문 영역의 "배경"을 탭했을 때만, 왼쪽 절반은 이전 화면 오른쪽 절반은 다음 화면으로 보낸다.
 *
 * 터치 응답자 협상은 가장 깊은 뷰에서 위로 올라간다. 말풍선·칩·버튼처럼 스스로 터치를 받는 요소가
 * 먼저 응답자가 되면 이 뷰의 `onStartShouldSetResponder` 는 아예 불리지 않는다. 그래서 어떤 요소 위에서
 * 누른 터치도 여기로 새지 않고, 아무도 받지 않은 빈 배경만 이 뷰가 받는다 — 항상 요소보다 아래층이다.
 * 스크롤이 터치를 가져가면(terminate) 탭으로 치지 않는다.
 *
 * 두 핸들러가 모두 없으면 터치를 받지 않아 아무 일도 하지 않는다.
 */
export default function InfernoEpisodeTapZones({
  onPreviousTap,
  onNextTap,
  children,
}: InfernoEpisodeTapZonesProps) {
  const viewRef = useRef<View>(null);
  const start = useRef({ x: 0, y: 0 });
  const enabled = Boolean(onPreviousTap || onNextTap);

  function handleStartShouldSetResponder() {
    return enabled;
  }

  function handleResponderGrant(event: GestureResponderEvent) {
    start.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY };
  }

  function handleResponderRelease(event: GestureResponderEvent) {
    const { pageX, pageY } = event.nativeEvent;
    const moved = Math.hypot(pageX - start.current.x, pageY - start.current.y);
    if (moved > TAP_MAX_MOVE) return;
    // locationX 는 눌린 자식 기준이라, 이 뷰의 화면상 위치와 폭을 재서 좌우를 가른다.
    function handleMeasured(x: number, _y: number, width: number) {
      if (pageX < x + width / 2) onPreviousTap?.();
      else onNextTap?.();
    }
    viewRef.current?.measureInWindow(handleMeasured);
  }

  return (
    <View
      ref={viewRef}
      className="flex-1"
      onStartShouldSetResponder={handleStartShouldSetResponder}
      onResponderGrant={handleResponderGrant}
      onResponderRelease={handleResponderRelease}
    >
      {children}
    </View>
  );
}
