/**
 * [DRAFT] 1화 등장인물 소개. Figma `ep1-시작` Introduce (7855:3296, 7855:3711).
 *
 * "Introduce" 제목 아래 반죽 세 마리가 60 간격으로 나란히 서고, 반죽마다 이름(H4)과 나와의 관계(XS)를
 * 붙인다. 시즌 출연진은 6명(나 포함)이라 시안 한 장에 세 마리씩, 두 장으로 나눠 보여준다(사용자 결정).
 * 몇 번째 장인지는 use-episode-playback 이 들고 있어서 이 컴포넌트는 받은 세 마리만 그린다. 화면 아무
 * 곳이나 누르거나 상단 바 "다음화면 >"를 누르면 다음 장, 마지막 장이면 본문으로 넘어간다.
 *
 * 이름·관계는 말줄임 없이 다 보여야 한다(사용자 결정). 칸 폭을 고정하지 않고 이름에 맞춰 늘어나게 했고
 * (최소 150), 한 줄에 다 안 들어갈 만큼 길면 잘리지 않고 줄을 바꾼다.
 *
 * 애착 유형 이름은 서버가 보내도 쓰지 않는다(변환 단계에서 이미 버린다 — utils/map-story.ts).
 */
import { Pressable, View } from 'react-native';

import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import { okMallangBTitleStyle } from '@/src/constants/typography';
import { findDoughFigure } from '@/src/features/inferno/constants/dough-figures';
import type { StageCastMember } from '@/src/features/inferno/types/story';

interface InfernoCastIntroProps {
  /** 이 장에 놓을 등장인물(세 명). */
  members: StageCastMember[];
  /** 다음 장(마지막 장이면 본문으로). */
  onNext: () => void;
}

export default function InfernoCastIntro({ members, onNext }: InfernoCastIntroProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="등장인물 소개. 눌러서 다음 보기"
      className="flex-1 flex-col items-center justify-center gap-[12px]"
      onPress={onNext}
    >
      <Text className="text-center text-pink-500" style={okMallangBTitleStyle}>
        Introduce
      </Text>
      <View className="flex-row items-start justify-center gap-[60px]">
        {members.map((member) => (
          <View key={member.breadId} className="min-w-[150px] shrink flex-col items-center gap-[8px]">
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
      </View>
    </Pressable>
  );
}
