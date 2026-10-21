import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import TextField from '@/src/components/ui/text-field';

interface SettingsFieldRowProps {
  label: string;
  value: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  /** 오른쪽 작은 버튼 문구. 없으면 버튼을 그리지 않는다. 예: "수정", "복사" */
  actionLabel?: string;
  onActionPress?: () => void;
}

/** 제목 + 입력칸 + 오른쪽 작은 버튼 한 줄. Figma "그룹 설정하기 - 리원"의 6606:4045 · 6606:4136. */
export default function SettingsFieldRow({
  label,
  value,
  onChangeText,
  placeholder,
  editable = false,
  actionLabel,
  onActionPress,
}: SettingsFieldRowProps) {
  return (
    <View className="w-full flex-col items-start gap-[8px]">
      <Text variant="heading-h5" className="text-text-primary">
        {label}
      </Text>
      <View className="w-full flex-row items-center gap-[4px]">
        <View className="flex-1">
          <TextField
            value={value}
            onChangeText={onChangeText ?? noop}
            placeholder={placeholder}
            editable={editable}
            accessibilityLabel={label}
          />
        </View>
        {actionLabel ? <Button label={actionLabel} variant="fieldAction" onPress={onActionPress} /> : null}
      </View>
    </View>
  );
}

function noop() {}
