import { Pressable } from 'react-native';

import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import type { InfernoParticipant } from '@/src/features/inferno/types';

interface InfernoDoughChipProps {
  person: InfernoParticipant;
  /** 소개 모달이 이 반죽을 보여주는 중이면 분홍(7855:3923), 아니면 노랑(7855:3590). */
  selected: boolean;
  onPress: (id: string) => void;
}

/**
 * 전체대화 위 반죽 칩. Figma `option` (7855:3590).
 *
 * 152 폭 안에 작은 반죽(32x24)과 이름(XXS)이 8 간격으로 가운데 선다. 누르면 그 반죽 소개가 뜬다.
 */
export default function InfernoDoughChip({ person, selected, onPress }: InfernoDoughChipProps) {
  function handleChipPress() {
    onPress(person.id);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${person.name} 소개 보기`}
      accessibilityState={{ selected }}
      className={`w-[152px] flex-row items-center justify-center gap-[8px] rounded-[8px] px-[8px] py-[4px] ${selected ? 'bg-pink-300' : 'bg-yellow-100'}`}
      onPress={handleChipPress}
    >
      <BreadCharacter type={person.type} state="dough" className="h-[24px] w-[32px]" />
      <Text variant="body-xxs" className="shrink text-center text-text-primary" numberOfLines={1}>
        {person.name}
      </Text>
    </Pressable>
  );
}
