import { View } from 'react-native';

import BreadCharacter, {
  type BreadState,
  type BreadType,
} from '@/src/assets/images/BreadCharacter';

/**
 * 빵 8마리가 흩어져 있는 장식 묶음.
 *
 * 온보딩(5461:3454, 236 x 169.2)과 설문(6248:5318, 210.3 x 150.8)이 같은 배열을
 * 0.8913 배율로 쓰고 종횡비도 1.3948 로 같다. 그래서 좌표를 컨테이너 대비 %로 정규화해
 * 한 컴포넌트로 둘 다 쓴다. 크기는 호출부가 className 으로 준다.
 *
 * NOTE: 여기만 absolute 를 쓴다(§16 예외). 8마리가 서로 어긋난 오프셋으로 흩어져 있어
 * flex 로는 Figma 배치를 재현할 수 없다. 예외를 이 컴포넌트 안에 가둬 둔다.
 *
 * 배열 순서 = Figma 의 쌓임 순서라 그대로 둘 것.
 */
const LAYOUT: { type: BreadType; className: string }[] = [
  { type: 'pretzel', className: 'absolute left-[16.818%] top-[33.972%] h-[30.128%] w-[26.655%]' },
  { type: 'salt', className: 'absolute left-[0%] top-[5.036%] h-[30.917%] w-[32.817%]' },
  { type: 'cream', className: 'absolute left-[70.860%] top-[5.130%] h-[26.923%] w-[28.953%]' },
  { type: 'baguette', className: 'absolute left-[48.987%] top-[32.051%] h-[31.410%] w-[29.413%]' },
  { type: 'castella', className: 'absolute left-[39.640%] top-[0%] h-[27.564%] w-[25.276%]' },
  { type: 'redbean', className: 'absolute left-[1.653%] top-[66.024%] h-[25.641%] w-[29.413%]' },
  { type: 'donut', className: 'absolute left-[70.589%] top-[57.052%] h-[33.974%] w-[29.413%]' },
  { type: 'madeleine', className: 'absolute left-[37.500%] top-[72.436%] h-[27.564%] w-[26.196%]' },
];

export interface BreadClusterProps {
  state: BreadState;
  /** Figma 의 묶음 크기를 그대로 준다. 예) 온보딩 h-[169px] w-[236px] */
  className?: string;
}

export default function BreadCluster({ state, className }: BreadClusterProps) {
  const label = state === 'dough' ? '여덟 가지 반죽 캐릭터' : '여덟 가지 빵 캐릭터';

  return (
    <View
      className={`relative ${className ?? ''}`}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      {LAYOUT.map((item) => (
        <BreadCharacter key={item.type} type={item.type} state={state} className={item.className} />
      ))}
    </View>
  );
}
