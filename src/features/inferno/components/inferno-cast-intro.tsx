/**
 * [DRAFT] 1화 등장인물 소개. Figma `ep1-시작` Introduce (7855:3296, 7855:3711).
 *
 * "Introduce" 제목 아래 반죽들이 60 간격으로 나란히 서고, 반죽마다 이름(H4)과 나와의 관계(XS)를
 * 붙인다. 시안은 세 마리지만 서버가 더 보내면 화면을 넘치므로 가로로 넘겨 볼 수 있게 두고,
 * 다 들어가면 가운데에 모은다. 화면 아무 곳이나 누르면 다음(상황 소개 또는 본문)으로 넘어간다.
 *
 * 애착 유형 이름은 서버가 보내도 쓰지 않는다(변환 단계에서 이미 버린다 — utils/map-story.ts).
 */
import { Pressable, ScrollView, View } from 'react-native';

import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import { okMallangBTitleStyle } from '@/src/constants/typography';
import { findDoughFigure } from '@/src/features/inferno/constants/dough-figures';
import type { StageCastMember } from '@/src/features/inferno/types/story';

interface InfernoCastIntroProps {
  cast: StageCastMember[];
  onStart: () => void;
}

export default function InfernoCastIntro({ cast, onStart }: InfernoCastIntroProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="등장인물 소개. 눌러서 계속하기"
      className="flex-1 flex-col items-center justify-center gap-[12px]"
      onPress={onStart}
    >
      <Text className="text-center text-pink-500" style={okMallangBTitleStyle}>
        Introduce
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="w-full grow-0"
        contentContainerClassName="grow flex-row items-start justify-center gap-[60px] px-[40px]"
      >
        {cast.map((member) => (
          <View key={member.breadId} className="flex-col items-center gap-[8px]">
            <BreadCharacter
              type={member.type}
              state="personDough"
              className={findDoughFigure(member.type).chatSizeClass}
              accessibilityLabel={member.name}
            />
            <View className="flex-col items-center">
              <Text variant="heading-h4" className="text-center text-inferno-instruction">
                {member.name}
              </Text>
              <Text variant="body-xs" className="text-center text-inferno-instruction">
                {member.role}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </Pressable>
  );
}
