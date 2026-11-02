import { View } from 'react-native';

import Text from '@/src/components/ui/text';

interface InfernoEpisodeBarProps {
  label: string;
}

/**
 * 카드 아래쪽의 에피소드 제목 바. Figma `Frame 121` (6159:3327), `ep1-시작` (7859:3982).
 *
 * 회차 이름이 서버가 쓴 상황 한 줄이라 시안보다 길 수 있다. 넘치면 가운데 정렬로 줄을 바꾼다.
 */
export default function InfernoEpisodeBar({ label }: InfernoEpisodeBarProps) {
  return (
    <View className="w-full flex-row items-center justify-center overflow-hidden rounded-[8px] bg-yellow-200 py-[10px]">
      <Text variant="heading-h4" className="shrink text-center text-text-primary">
        {label}
      </Text>
    </View>
  );
}
