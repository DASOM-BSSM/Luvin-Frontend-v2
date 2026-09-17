import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import AngleUpIcon from '@/src/assets/icons/AngleUpIcon';
import BottomNav from '@/src/components/bottom-nav';
import BreadCluster from '@/src/components/bread-cluster';
import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { useSurveyStore } from '@/src/features/survey/store/survey-store';

/**
 * 설문 시작 화면. Figma "Luvin-Design" / `설문-우린` (6248:5218).
 *
 * 세로 배치는 Figma 프레임(402 x 874) 기준이다.
 * 상단 70 과 하단 44 는 고정, 남는 공간은 본문 위/아래로 Figma 비율(127.2 : 178)로 나눈다.
 */
export default function SurveyIntroScreen() {
  const resetSurvey = useSurveyStore((state) => state.resetSurvey);

  function handleExitPress() {
    // 온보딩에서 들어온 경우가 정상 경로고, 딥링크로 바로 열렸으면 돌아갈 곳이 없다.
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  }

  function handleStartButtonPress() {
    // 시작할 때마다 처음부터. 이어하기는 답안을 MMKV 에 저장한 뒤에 붙인다(§12).
    resetSurvey();
    router.push('/survey/questions');
  }

  return (
    <View className="flex-1 bg-default-bg">
      <View className="h-[70px]" />

      <View className="px-[30px]">
        <Pressable
          accessibilityRole="button"
          className="w-full flex-row items-center gap-[4px]"
          onPress={handleExitPress}
        >
          {/* Figma 도 `uit:angle-up` 을 -90도 돌려 뒤로가기로 쓴다. */}
          <View className="-rotate-90">
            <AngleUpIcon />
          </View>
          <Text variant="body-s" className="text-default-black">
            나가기
          </Text>
        </Pressable>
      </View>

      <View className="flex-[127]" />

      <View className="w-full items-center px-[30px]">
        <View className="w-full items-center gap-[40px]">
          <View className="items-center gap-[4px]">
            <Text variant="heading-h1" className="text-default-black">
              나만의 반죽 만들기
            </Text>
            {/* Figma 에서 이 줄만 변수 바인딩 없이 #000000 이라 default/black 토큰으로 맞췄다. */}
            <Text variant="body-m" className="text-default-black">
              질문에 답하여 나만의 반죽을 만들어요
            </Text>
          </View>

          <BreadCluster state="dough" className="h-[150.8px] w-[210.35px]" />

          <View className="w-full gap-[12px]">
            <Button label="시작하기" variant="secondary" onPress={handleStartButtonPress} />
            <Text variant="body-s" className="text-center text-text-muted">
              예상 시간 10분
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-[178]" />

      <View className="w-full items-center">
        <BottomNav active="bread" />
      </View>

      <View className="h-[44px]" />
    </View>
  );
}
