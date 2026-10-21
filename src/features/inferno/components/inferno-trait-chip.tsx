import { View } from 'react-native';

import Text from '@/src/components/ui/text';

interface InfernoTraitChipProps {
  label: string;
}

/**
 * ep5 리포트의 강점/약점 칩 하나. Figma ep5-결과(6825:5144): pink/200 바탕에 pink/300 테두리 1, 둥글게(100),
 * 좌우 12·위아래 4, 글은 Body/S 순수 검정(#000 — 토큰은 `inferno-instruction`).
 */
export default function InfernoTraitChip({ label }: InfernoTraitChipProps) {
  return (
    <View className="items-center justify-center rounded-[100px] border border-pink-300 bg-pink-200 px-[12px] py-[4px]">
      <Text variant="body-s" className="text-inferno-instruction">
        {label}
      </Text>
    </View>
  );
}
