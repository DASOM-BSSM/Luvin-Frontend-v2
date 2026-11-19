import { View } from 'react-native';

import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import BreadTraitList from '@/src/features/bread/components/bread-trait-list';
import type { BreadIntro } from '@/src/features/bread/types';

interface BreadIntroCardProps {
  intro: BreadIntro;
}

/**
 * 빵 소개 화면의 빵 한 종류 카드. 시안이 없어 "내 성향" 화면의 `MyProfileCard`(yellow/200
 * 카드, 반죽 그림 + 제목) 와 `BreadTraitList` 모양을 그대로 따랐다.
 */
export default function BreadIntroCard({ intro }: BreadIntroCardProps) {
  return (
    <View className="w-full flex-col gap-[12px] rounded-[8px] bg-yellow-200 p-[20px]">
      <View className="w-full flex-row items-center gap-[16px]">
        <BreadCharacter
          type={intro.type}
          state="dough"
          className="h-[45px] w-[76px]"
          accessibilityLabel={`${intro.name} 반죽`}
        />
        <View className="flex-1 flex-col items-start gap-[4px]">
          <Text variant="heading-h4" className="text-default-black">
            {intro.name}
          </Text>
          <Text variant="body-xs" className="text-default-black">
            {intro.summary}
          </Text>
        </View>
      </View>
      <BreadTraitList traits={intro.traits} />
    </View>
  );
}
