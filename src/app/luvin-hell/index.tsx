import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import AngleUpIcon from '@/src/assets/icons/AngleUpIcon';
import Button from '@/src/components/ui/button';
import OkMallangBText from '@/src/components/ui/ok-mallang-b-text';
import Text from '@/src/components/ui/text';
import { pink } from '@/src/constants/colors';
import { useTokenStore } from '@/src/features/luvin-hell/store/token-store';

/** 러빈지옥 미니게임 모드 선택. Figma "Choose Your Mode" (5916:5300). */
export default function LuvinHellModeSelectScreen() {
  const balance = useTokenStore((state) => state.balance);

  function handleExitPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
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
            {/* 미니게임 2종의 실제 화면/로직은 아직 별도로 커밋되지 않아, 두 버튼 모두
                일부러 onPress 없이 둔다 — 눌러도 아무 데도 이동하지 않는다. */}
            <View className="w-full flex-col gap-[20px]">
              <Button label="공룡빵게임" variant="modeSelectPrimary" className="w-full" />
              <Button label="빵건너친구들" variant="modeSelectSecondary" className="w-full" />
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
