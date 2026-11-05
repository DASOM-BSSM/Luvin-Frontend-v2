import { View } from 'react-native';

import Text from '@/src/components/ui/text';
import { leadingOffsets } from '@/src/lib/slider-math';

/** 손잡이 지름. 슬라이더 본체와 눈금 위치 계산이 같은 값을 써야 해서 여기서 내보낸다. */
export const SLIDER_THUMB_SIZE = 28;

/** 라벨 한 칸의 폭. 눈금 중심에 맞춰 가운데 정렬한다. */
export const SLIDER_LABEL_WIDTH = 48;

/** 슬라이더 좌우로 라벨이 삐져나올 수 있는 만큼. 양끝 라벨이 잘리지 않게 본체가 안쪽 여백으로 잡는다. */
export const SLIDER_SIDE_OVERFLOW = (SLIDER_LABEL_WIDTH - SLIDER_THUMB_SIZE) / 2;

const TICK_WIDTH = 2;

export interface SliderMark {
  /** 0~1. */
  position: number;
  label: string;
}

interface SliderMarksProps {
  marks: readonly SliderMark[];
  trackWidth: number;
  /** 지금 손잡이가 얹힌 눈금의 위치. 눈금이 아닌 곳이면 undefined. */
  activePosition: number | undefined;
}

/**
 * 슬라이더 아래의 눈금 점과 라벨.
 *
 * 점·라벨의 가로 위치는 트랙 폭에서 정해지는 값이라 클래스로 쓸 수 없어 style 로 준다 —
 * ProgressBar 와 같은 이유의, 동적 값에 대한 §16 예외다.
 */
export default function SliderMarks({ marks, trackWidth, activePosition }: SliderMarksProps) {
  const travel = Math.max(0, trackWidth - SLIDER_THUMB_SIZE);
  const centers = marks.map((mark) => SLIDER_THUMB_SIZE / 2 + mark.position * travel);
  const tickOffsets = leadingOffsets(centers, TICK_WIDTH);
  const labelOffsets = leadingOffsets(centers, SLIDER_LABEL_WIDTH);

  return (
    <View className="w-full flex-col gap-[6px]">
      <View className="h-[6px] w-full flex-row">
        {marks.map((mark, index) => (
          <View
            key={mark.label}
            className="h-full w-[2px] rounded-full bg-pink-600"
            style={{ marginLeft: tickOffsets[index] }}
          />
        ))}
      </View>
      <View className="w-full flex-row">
        {marks.map((mark, index) => (
          <View
            key={mark.label}
            className="w-[48px] items-center"
            style={{ marginLeft: labelOffsets[index] }}
          >
            <Text
              variant="body-xs"
              className={mark.position === activePosition ? 'text-text-primary' : 'text-text-muted'}
            >
              {mark.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
