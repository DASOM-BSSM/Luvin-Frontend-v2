import { View } from 'react-native';

import BreadNavIcon from '@/src/assets/icons/BreadNavIcon';
import HomeNavIcon from '@/src/assets/icons/HomeNavIcon';
import OvenNavIcon from '@/src/assets/icons/OvenNavIcon';
import SentimentNavIcon from '@/src/assets/icons/SentimentNavIcon';
import theme from '@/src/constants/theme';

export type BottomNavItem = 'home' | 'oven' | 'diary' | 'bread';

/** Figma: 선택된 항목은 `brown color/900`, 나머지는 `brown color/300`. */
const ACTIVE_COLOR = theme.brown[900];
const INACTIVE_COLOR = theme.brown[300];

function iconColor(item: BottomNavItem, active: BottomNavItem): string {
  return item === active ? ACTIVE_COLOR : INACTIVE_COLOR;
}

interface BottomNavProps {
  active?: BottomNavItem;
}

/**
 * 하단 알약형 내비게이션.
 *
 * Figma: `Nav` 컴포넌트 (variant `nav=home`).
 * 아직 다른 탭 화면이 없어서 표시 전용이다. 라우팅은 탭 화면이 생길 때 연결한다.
 */
export default function BottomNav({ active = 'home' }: BottomNavProps) {
  return (
    <View className="flex-row items-center justify-center gap-[64px] self-center rounded-[24px] bg-yellow-200 px-[30px] py-[16px]">
      <HomeNavIcon color={iconColor('home', active)} />
      <OvenNavIcon color={iconColor('oven', active)} />
      <SentimentNavIcon color={iconColor('diary', active)} />
      <BreadNavIcon color={iconColor('bread', active)} />
    </View>
  );
}
