import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import Text from '@/src/components/ui/text';

interface SectionHeaderProps {
  title: string;
  /** 제목 왼쪽 아이콘. 제목과 4px 띄운다(감정일기 홈 "쫀쫀한 조합들" 5950:6772). */
  icon?: ReactNode;
  /** 오른쪽 바로가기 문구. 화살표(→)까지 포함된 문자열을 그대로 받는다. */
  actionLabel?: string;
  /** 지정하면 actionLabel이 눌리는 링크가 된다. 없으면 지금처럼 그냥 텍스트로만 보여준다. */
  onActionPress?: () => void;
}

/** 섹션 제목 + 오른쪽 바로가기 문구 한 줄. */
export default function SectionHeader({ title, icon, actionLabel, onActionPress }: SectionHeaderProps) {
  return (
    <View className="w-full flex-row items-center justify-between">
      <View className="flex-row items-center gap-[4px]">
        {icon}
        <Text variant="heading-h4" className="text-text-primary">
          {title}
        </Text>
      </View>
      {actionLabel ? (
        onActionPress ? (
          <Pressable accessibilityRole="link" onPress={onActionPress}>
            <Text variant="body-xs" className="text-text-muted">
              {actionLabel}
            </Text>
          </Pressable>
        ) : (
          <Text variant="body-xs" className="text-text-muted">
            {actionLabel}
          </Text>
        )
      ) : null}
    </View>
  );
}
