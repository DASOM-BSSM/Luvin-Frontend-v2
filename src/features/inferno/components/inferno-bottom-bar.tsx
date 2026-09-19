import { View } from 'react-native';

import Text from '@/src/components/ui/text';

interface InfernoBottomBarProps {
  /** 예: "Episode 00 :: 러빈지옥에 대해 알려드릴게요" */
  label: string;
  onSkipPress?: () => void;
}

/**
 * 러빈지옥 본문 하단 바. Figma `Frame 80` (6340:8367).
 *
 * 왼쪽에 지금 보고 있는 에피소드, 오른쪽에 건너뛰기.
 */
export default function InfernoBottomBar({ label, onSkipPress }: InfernoBottomBarProps) {
  return (
    <View className="h-[51px] w-full flex-row items-center justify-between overflow-hidden bg-yellow-200 px-[28px]">
      <Text variant="heading-h4" className="text-text-muted">
        {label}
      </Text>
      <Text variant="body-m" className="text-text-muted" onPress={onSkipPress}>
        에피소드 스킵하기
      </Text>
    </View>
  );
}
