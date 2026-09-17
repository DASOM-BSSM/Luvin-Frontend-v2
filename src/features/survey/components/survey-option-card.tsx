import { Pressable } from 'react-native';

import Text from '@/src/components/ui/text';
import type { SurveyOptionId } from '@/src/features/survey/types';
import { formatQuestionNumber } from '@/src/features/survey/utils/format';

export interface SurveyOptionCardProps {
  optionId: SurveyOptionId;
  /** 카드에 보이는 보기 번호(1부터). */
  number: number;
  label: string;
  onSelect: (optionId: SurveyOptionId) => void;
}

/**
 * 문항의 보기 카드. Figma `설문-우린` (5659:2295).
 *
 * NOTE: Figma 에 선택됨 / 눌림 상태가 아직 없어서 기본 상태만 있다. 그래서 이전 문항으로
 * 돌아가도 전에 고른 보기가 표시되지 않는다. 상태 디자인이 나오면 여기에 추가할 것.
 */
export default function SurveyOptionCard({
  optionId,
  number,
  label,
  onSelect,
}: SurveyOptionCardProps) {
  function handlePress() {
    onSelect(optionId);
  }

  return (
    <Pressable
      accessibilityRole="button"
      className="w-full gap-[2px] rounded-[8px] bg-yellow-300 px-[30px] py-[16px]"
      onPress={handlePress}
    >
      <Text variant="body-xs" className="text-text-primary">
        {formatQuestionNumber(number)}
      </Text>
      <Text variant="heading-h4" className="text-text-primary">
        {label}
      </Text>
    </Pressable>
  );
}
