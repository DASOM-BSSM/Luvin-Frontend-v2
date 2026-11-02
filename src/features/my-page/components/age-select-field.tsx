/**
 * [DRAFT] 나이 선택. 시안이 없어 바로 옆 성별 선택 칩(GenderSelectButton)과 같은 모양의
 * −/+ 칩으로 만든다. 마이페이지가 쓴다.
 */
import { View } from 'react-native';

import Text from '@/src/components/ui/text';
import GenderSelectButton from '@/src/features/my-page/components/gender-select-button';
import { MAX_AGE, MIN_AGE, stepAge } from '@/src/features/my-page/utils/age';

interface AgeSelectFieldProps {
  /** 아직 고르지 않았으면 undefined. */
  value?: number;
  onChange: (age: number) => void;
}

export default function AgeSelectField({ value, onChange }: AgeSelectFieldProps) {
  function handleDecreasePress() {
    onChange(stepAge(value, -1));
  }

  function handleIncreasePress() {
    onChange(stepAge(value, 1));
  }

  return (
    <View className="flex-row items-center gap-[8px]">
      <GenderSelectButton
        label="−"
        selected={false}
        onPress={handleDecreasePress}
        accessibilityLabel="나이 줄이기"
        disabled={value === MIN_AGE}
      />
      <View className="min-w-[72px] items-center">
        <Text
          variant="body-s"
          className={value === undefined ? 'text-text-muted' : 'text-text-primary'}
        >
          {value === undefined ? '나이 선택' : `${value}세`}
        </Text>
      </View>
      <GenderSelectButton
        label="+"
        selected={false}
        onPress={handleIncreasePress}
        accessibilityLabel="나이 늘리기"
        disabled={value === MAX_AGE}
      />
    </View>
  );
}
