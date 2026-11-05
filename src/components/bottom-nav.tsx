import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import BreadNavIcon from '@/src/assets/icons/BreadNavIcon';
import HomeNavIcon from '@/src/assets/icons/HomeNavIcon';
import OvenNavIcon from '@/src/assets/icons/OvenNavIcon';
import SentimentNavIcon from '@/src/assets/icons/SentimentNavIcon';
import theme from '@/src/constants/theme';

/** 'none' 은 마이페이지처럼 탭 바에 없는 화면에서 쓴다 — 네 아이콘 다 비활성 색으로 보인다. */
export type BottomNavItem = 'home' | 'oven' | 'diary' | 'bread' | 'none';

/** 선택된 항목은 brown 900, 나머지는 brown 300 을 쓴다. */
const ACTIVE_COLOR = theme.brown[900];
const INACTIVE_COLOR = theme.brown[300];

function iconColor(item: BottomNavItem, active: BottomNavItem): string {
  return item === active ? ACTIVE_COLOR : INACTIVE_COLOR;
}

interface BottomNavProps {
  active?: BottomNavItem;
}

/**
 * 하단 알약형 내비게이션. 탭 이동은 이 컴포넌트가 직접 처리한다(bread-survey-prompt-card 등과 같은 패턴).
 * 탭 이동은 navigate 로 처리해 (tabs) 네비게이터가 탭 순서에 맞춰 전환(슬라이드)하게 한다.
 * 탭 바깥 화면(설문, 마이페이지)에서도 같은 컴포넌트를 쓴다.
 */
export default function BottomNav({ active = 'home' }: BottomNavProps) {
  function handleHomeTabPress() {
    if (active === 'home') return;
    router.navigate('/');
  }

  function handleOvenTabPress() {
    if (active === 'oven') return;
    router.navigate('/oven');
  }

  function handleDiaryTabPress() {
    if (active === 'diary') return;
    router.navigate('/diaries');
  }

  function handleBreadTabPress() {
    if (active === 'bread') return;
    router.navigate('/bread');
  }

  return (
    <View className="flex-row items-center justify-center gap-[64px] self-center rounded-[24px] bg-yellow-200 px-[30px] py-[16px]">
      <Pressable accessibilityRole="button" onPress={handleHomeTabPress}>
        <HomeNavIcon color={iconColor('home', active)} />
      </Pressable>
      <Pressable accessibilityRole="button" onPress={handleOvenTabPress}>
        <OvenNavIcon color={iconColor('oven', active)} />
      </Pressable>
      <Pressable accessibilityRole="button" onPress={handleDiaryTabPress}>
        <SentimentNavIcon color={iconColor('diary', active)} />
      </Pressable>
      <Pressable accessibilityRole="button" onPress={handleBreadTabPress}>
        <BreadNavIcon color={iconColor('bread', active)} />
      </Pressable>
    </View>
  );
}
