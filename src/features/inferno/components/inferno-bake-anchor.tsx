import type { ReactNode } from 'react';
import { View } from 'react-native';

interface InfernoBakeAnchorProps {
  children: ReactNode;
}

/**
 * ep5 등장 연출의 빛·연기를 두 마리 줄의 정가운데에 붙이는 기준점. 줄 전체를 덮는 겹을 깔고 그 가운데에
 * 크기 0 인 점을 두면, 자식은 `left/top` 에 자기 크기의 절반만 빼서 가운데를 맞출 수 있다.
 *
 * 처음엔 자식에 `left: '50%'` + 음수 margin 을 줬는데, iOS 시뮬레이터에서 연기가 줄 가운데가 아니라 오른쪽으로
 * 크게 밀렸다(가로 줄 안 절대 배치의 퍼센트 기준이 기대와 달랐다). 숫자 값만 쓰는 이 방식으로 바꿨다.
 * 겹쳐 그려야 해서 절대 배치를 쓴다(§16 예외, 줄넘기 장면과 같은 이유).
 */
export default function InfernoBakeAnchor({ children }: InfernoBakeAnchorProps) {
  return (
    <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
      <View className="h-0 w-0">{children}</View>
    </View>
  );
}
