import { Pressable, View } from 'react-native';

import BreadCharacter, { type BreadType } from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import { findDoughFigure } from '@/src/features/inferno/constants/dough-figures';

interface InfernoVoteOptionProps {
  /** 선택지 키. 혼자 있기는 null. */
  optionId: string | null;
  name: string;
  /** 이름 아래 캡션. 이 빵과의 기억 한 줄(예: "내 말을 끝까지 들어줌"). 없으면 이름만. */
  caption?: string;
  /** 칸 폭 클래스. */
  widthClass: string;

  /** 반죽 그림. 없으면(혼자 있기) 이름만 가운데 둔다(Figma 7866:4205). */
  breadType?: BreadType;
  selected: boolean;
  disabled: boolean;
  /** 누른 선택지의 키를 돌려준다. 목록에서 익명 함수를 만들지 않으려고 여기서 감싼다(§16). */
  onSelect: (optionId: string | null) => void;
}

/**
 * 투표지의 선택지 한 칸. Figma `option` (5456:2918, 투표 그리드 7866:4188).
 *
 * 고른 것만 바탕이 진해진다(yellow/300). 시안에 테두리나 체크 표시가 없어서 색이 유일한
 * 표시라, 화면 낭독기에는 accessibilityState 로 따로 알린다.
 *
 * 투표지 2차 시안(5452:1989)은 이름만이지만 이름 아래 캡션(기억 한 줄)을 붙인다(사용자 결정). 칸 높이는
 * 시안 56 그대로라 캡션은 한 줄 말줄임이다.
 *
 * personDough(팔다리 있는 반죽)를 쓴다(BreadCharacter 주석 참고).
 */
export default function InfernoVoteOption({
  optionId,
  name,
  caption,
  widthClass,
  breadType,
  selected,
  disabled,
  onSelect,
}: InfernoVoteOptionProps) {
  function handlePress() {
    onSelect(optionId);
  }

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={caption ? `${name}, ${caption}` : name}
      disabled={disabled}
      className={`h-[56px] flex-row items-center gap-[16px] rounded-[8px] px-[24px] ${widthClass} ${
        breadType ? '' : 'justify-center'
      } ${selected ? 'bg-yellow-300' : 'bg-yellow-100'}`}
      onPress={handlePress}
    >
      {breadType ? (
        <BreadCharacter
          type={breadType}
          state="personDough"
          className={findDoughFigure(breadType).optionSizeClass}
        />
      ) : null}
      <View className="shrink flex-col">
        <Text variant="body-m" className="text-text-primary" numberOfLines={1}>
          {name}
        </Text>
        {caption ? (
          <Text variant="body-xxs" className="text-text-muted" numberOfLines={1}>
            {caption}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
