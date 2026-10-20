import { View } from 'react-native';

interface SegmentedProgressProps {
  /** 칸 수. 시안은 7칸이다. */
  count: number;
  /** 분홍으로 칠할 칸(0부터). 없으면 모두 회색. */
  activeIndex?: number;
}

interface SegmentProps {
  active: boolean;
}

const Segment = ({ active }: SegmentProps) => (
  <View className={`h-full flex-1 rounded-full ${active ? 'bg-pink-400' : 'bg-default-gray'}`} />
);

/** 헤더 아래 칸 막대. Figma "감정일기 메인 - 제민"(5942:5456)의 5950:5745 — 높이 4, 칸 사이 2. */
export default function SegmentedProgress({ count, activeIndex }: SegmentedProgressProps) {
  return (
    <View className="h-[4px] w-full flex-row items-center gap-[2px]">
      {Array.from({ length: count }, (_, index) => (
        <Segment key={index} active={index === activeIndex} />
      ))}
    </View>
  );
}
