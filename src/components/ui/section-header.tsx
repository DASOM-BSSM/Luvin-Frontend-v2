import { View } from 'react-native';

import Text from '@/src/components/ui/text';

interface SectionHeaderProps {
  title: string;
  /** 오른쪽 바로가기 문구. 화살표(→)까지 포함된 문자열을 그대로 받는다. */
  actionLabel?: string;
}

/** 섹션 제목 + 오른쪽 바로가기 문구 한 줄. */
export default function SectionHeader({ title, actionLabel }: SectionHeaderProps) {
  return (
    <View className="w-full flex-row items-center justify-between">
      <Text variant="heading-h4" className="text-text-primary">
        {title}
      </Text>
      {actionLabel ? (
        <Text variant="body-xs" className="text-text-muted">
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}
