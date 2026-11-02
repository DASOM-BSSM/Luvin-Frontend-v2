import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import AngleUpIcon from '@/src/assets/icons/AngleUpIcon';
import Text from '@/src/components/ui/text';
import BakingHelpFrame from '@/src/features/bread-baking/components/baking-help-frame';
import { BAKING_HELP_PAGES } from '@/src/features/bread-baking/constants/help';

/** 다솜이의 소금빵게임 설명. Figma "게임설명2" 4쪽 (6285:7219, 8026:3925, 8026:3990, 8026:4121). */
export default function BreadBakingAboutScreen() {
  const [pageIndex, setPageIndex] = useState(0);
  const isLastPage = pageIndex === BAKING_HELP_PAGES.length - 1;

  function handleExitPress() {
    router.back();
  }

  function handleNextPress() {
    setPageIndex((index) => Math.min(index + 1, BAKING_HELP_PAGES.length - 1));
  }

  return (
    <View className="flex-1 bg-default-bg">
      <View className="h-[70px]" />

      <View className="flex-col items-center gap-[20px] px-[31px]">
        <View className="w-full flex-col items-start gap-[20px]">
          <Pressable accessibilityRole="button" className="flex-row items-center" onPress={handleExitPress}>
            <View className="-rotate-90">
              <AngleUpIcon />
            </View>
            <Text variant="body-s" className="text-default-black">
              게임 설명 나가기
            </Text>
          </Pressable>
          <Text variant="heading-h2" className="w-full text-center text-default-black">
            다솜이의 소금빵게임 설명
          </Text>
        </View>

        <BakingHelpFrame page={BAKING_HELP_PAGES[pageIndex]}
          onNext={isLastPage ? undefined : handleNextPress} />

        <Text variant="body-m" className="text-center text-text-primary">
          3분이 지나기 전에 미션을 완료해야해요!!
        </Text>
      </View>
    </View>
  );
}
