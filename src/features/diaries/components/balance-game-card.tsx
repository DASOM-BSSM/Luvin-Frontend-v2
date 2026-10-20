import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import type { DailyQuestionOption } from '@/src/features/diaries/types';

interface BalanceGameCardProps {
  question: string;
  options: DailyQuestionOption[];
  /** 아직 고르지 않았으면 undefined. */
  selectedOptionId?: number;
  /** 이미 답했거나 답을 보내는 중이면 다시 못 누르게 막는다. */
  disabled?: boolean;
  onOptionPress: (optionId: number) => void;
}

interface BalanceGameOptionButtonProps {
  option: DailyQuestionOption;
  selected: boolean;
  disabled: boolean;
  /** 누른 보기의 id 를 돌려준다. 목록에서 익명 함수를 만들지 않으려고 여기서 감싼다(§16). */
  onPress: (optionId: number) => void;
}

/**
 * 보기 버튼 하나. 고른 보기는 Figma `hover=on`(2013:78) 색으로 바뀐다.
 *
 * 막혀 있어도 `Button` 의 `disabled`(회색) 를 쓰지 않는다 — 답한 뒤에도 고른 보기 색이 그대로
 * 보여야 해서, 누르기만 막는다.
 */
function BalanceGameOptionButton({ option, selected, disabled, onPress }: BalanceGameOptionButtonProps) {
  function handlePress() {
    if (disabled) return;
    onPress(option.optionId);
  }

  return (
    <Button
      label={option.content}
      variant={selected ? 'filledSelected' : 'filled'}
      textVariant="body-s"
      accessibilityState={{ selected, disabled }}
      onPress={handlePress}
    />
  );
}

/** 밸런스 게임 질문 + 보기. Figma "감정일기 홈"의 일일 밸런스게임(5746:4119). */
export default function BalanceGameCard({
  question,
  options,
  selectedOptionId,
  disabled = false,
  onOptionPress,
}: BalanceGameCardProps) {
  return (
    <View className="w-full flex-col items-center gap-[12px] rounded-[12px] px-[24px] py-[16px]">
      <Text variant="heading-h4" className="text-center text-brown-1000">
        {question}
      </Text>
      <View className="flex-row items-start gap-[16px]">
        {options.map((option) => (
          <BalanceGameOptionButton
            key={option.optionId}
            option={option}
            selected={option.optionId === selectedOptionId}
            disabled={disabled}
            onPress={onOptionPress}
          />
        ))}
      </View>
    </View>
  );
}
