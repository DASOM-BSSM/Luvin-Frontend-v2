import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import AngleUpIcon from '@/src/assets/icons/AngleUpIcon';
import Button from '@/src/components/ui/button';
import OkMallangBText from '@/src/components/ui/ok-mallang-b-text';
import Text from '@/src/components/ui/text';
import { pink } from '@/src/constants/colors';
import { useTokenStore } from '@/src/features/luvin-hell/store/token-store';
import useTokenBalance from '@/src/features/tokens/hooks/use-token-balance';

/** 러빈지옥 미니게임 모드 선택. Figma "Choose Your Mode" (5916:5300). */
export default function LuvinHellModeSelectScreen() {
  const balance = useTokenStore((state) => state.balance);
  useTokenBalance();

  function handleExitPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  }

  function handleBreadBakingPress() {
    router.push('/luvin-hell/bread-baking/play');
  }

  return (
    <View className="flex-1 bg-default-bg">
      <View className="h-[70px]" />

      <View className="flex-col gap-[160px] px-[30px]">
        <Pressable
          accessibilityRole="button"
          className="w-full flex-row items-center"
          onPress={handleExitPress}
        >
          <View className="-rotate-90">
            <AngleUpIcon />
          </View>
          <Text variant="body-s" className="text-default-black">
            나가기
          </Text>
        </Pressable>

        <View className="w-full flex-col items-center gap-[100px]">
          <View className="w-full flex-col items-center gap-[40px]">
            {/* Figma "Choose Your Mode"(5919:5427): 50px, pink-500 위 pink-200 테두리 ~1px —
                이 화면에만 쓰이는 1회성 크기/테두리라 typography.ts에 토큰화하지 않았다(§8 예외). */}
            <OkMallangBText
              fontSize={50}
              lineHeight={50 * 1.1}
              fill={pink[500]}
              stroke={pink[200]}
              strokeWidth={1}
              textAlign="center"
            >
              {'Choose\nYour Mode'}
            </OkMallangBText>
            <Text variant="body-m" className="text-default-black">
              현재 보유 토큰: 🥐x{balance}
            </Text>
            {/* Figma 5916:5300 은 두 게임만 둔다. 빵건너친구들 버튼은 시안대로 뺐다(2026-10-30 사용자 결정,
                게임 코드는 그대로). */}
            <View className="w-full flex-col gap-[20px]">
              <Button
                label="공룡빵게임"
                variant="modeSelect"
                className="w-full"
                onPress={() => router.push('/luvin-hell/dino-runner/play')}
              />
              <Button label="다솜이의 소금빵게임" variant="modeSelect" className="w-full"
                onPress={handleBreadBakingPress} />
            </View>
          </View>

          <Pressable accessibilityRole="link" onPress={() => router.push('/luvin-hell/about')}>
            <Text variant="body-s" className="text-center text-text-muted underline">
              미니게임이 뭔가요?
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
