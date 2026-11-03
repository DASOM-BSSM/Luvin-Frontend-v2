import { View } from 'react-native';

import { type BreadState, type BreadType } from '@/src/assets/images/BreadCharacter';
import JumpingBread from '@/src/components/jumping-bread';

/**
 * 빵 8마리가 흩어져 있는 장식 묶음.
 *
 * 온보딩(5461:3454, 236 x 169.2)과 설문(6248:5318, 210.3 x 150.8)이 같은 배열을
 * 0.8913 배율로 쓰고 종횡비도 1.3948 로 같다. 그래서 좌표를 컨테이너 대비 %로 정규화해
 * 한 컴포넌트로 둘 다 쓴다. 러빈지옥 ep0(6340:8406, 276 x 197.87)도 같은 배열이다.
 * 크기는 호출부가 className 으로 준다.
 *
 * NOTE: 여기만 absolute 를 쓴다(§16 예외). 8마리가 서로 어긋난 오프셋으로 흩어져 있어
 * flex 로는 Figma 배치를 재현할 수 없다. 예외를 이 컴포넌트 안에 가둬 둔다.
 */

/**
 * 배열 순서 = Figma 의 쌓임 순서라 그대로 둘 것.
 *
 * jumpDelayMs / jumpSpeed 는 8마리가 한꺼번에 뛰지 않게 흩어 놓은 값이다.
 * 일정한 간격으로 두면 파도타기처럼 보여서, 규칙이 눈에 안 띄도록 불규칙하게 골랐다.
 * 속도까지 조금씩 다르게 둬서 시간이 지나면 서로 더 어긋나 저마다 따로 노는 것처럼 보인다.
 */
const LAYOUT: {
  type: BreadType;
  className: string;
  jumpDelayMs: number;
  jumpSpeed: number;
}[] = [
  { type: 'pretzel', className: 'absolute left-[16.818%] top-[33.972%] h-[30.128%] w-[26.655%]', jumpDelayMs: 0, jumpSpeed: 1 },
  { type: 'salt', className: 'absolute left-[0%] top-[5.036%] h-[30.917%] w-[32.817%]', jumpDelayMs: 640, jumpSpeed: 1.12 },
  { type: 'cream', className: 'absolute left-[70.860%] top-[5.130%] h-[26.923%] w-[28.953%]', jumpDelayMs: 220, jumpSpeed: 0.93 },
  { type: 'baguette', className: 'absolute left-[48.987%] top-[32.051%] h-[31.410%] w-[29.413%]', jumpDelayMs: 980, jumpSpeed: 1.05 },
  { type: 'castella', className: 'absolute left-[39.640%] top-[0%] h-[27.564%] w-[25.276%]', jumpDelayMs: 380, jumpSpeed: 1.18 },
  { type: 'redbean', className: 'absolute left-[1.653%] top-[66.024%] h-[25.641%] w-[29.413%]', jumpDelayMs: 1240, jumpSpeed: 0.97 },
  { type: 'donut', className: 'absolute left-[70.589%] top-[57.052%] h-[33.974%] w-[29.413%]', jumpDelayMs: 830, jumpSpeed: 1.08 },
  { type: 'madeleine', className: 'absolute left-[37.500%] top-[72.436%] h-[27.564%] w-[26.196%]', jumpDelayMs: 500, jumpSpeed: 0.9 },
];

export interface BreadClusterProps {
  state: BreadState;
  /** Figma 의 묶음 크기를 그대로 준다. 예) 온보딩 h-[169px] w-[236px] */
  className?: string;
  /** 8마리가 제각각 통통 뛴다. 기본은 꺼짐이라 기존 화면은 그대로다. */
  jumping?: boolean;
  /**
   * 주면 이 시간 뒤부터 8마리가 배열 순서대로 하나씩 통 튀어나온다. 다 나온 빵부터 뛴다.
   * 기본은 없음이라 기존 화면은 처음부터 다 보인다.
   */
  popInDelayMs?: number;
}

/** 한 마리씩 튀어나오는 간격. 배열 순서가 위치상 흩어져 있어서 여기저기서 퐁퐁 나오는 것처럼 보인다. */
const POP_STAGGER_MS = 110;

export default function BreadCluster({
  state,
  className,
  jumping = false,
  popInDelayMs,
}: BreadClusterProps) {
  const label = state === 'dough' ? '여덟 가지 반죽 캐릭터' : '여덟 가지 빵 캐릭터';

  return (
    <View
      className={`relative ${className ?? ''}`}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      {LAYOUT.map((item, index) => (
        <JumpingBread
          key={item.type}
          type={item.type}
          state={state}
          className={item.className}
          jumpDelayMs={item.jumpDelayMs}
          jumpSpeed={item.jumpSpeed}
          jumping={jumping}
          popInDelayMs={
            popInDelayMs === undefined ? undefined : popInDelayMs + index * POP_STAGGER_MS
          }
        />
      ))}
    </View>
  );
}
