import BottomNav, { type BottomNavItem } from '@/src/components/bottom-nav';
import Screen from '@/src/components/ui/screen';

/** (tabs) 라우트 이름 -> BottomNav 항목. */
const ROUTE_TO_ITEM: Record<string, BottomNavItem> = {
  index: 'home',
  oven: 'oven',
  diaries: 'diary',
  bread: 'bread',
};

interface BottomTabBarProps {
  /** Tabs 의 `tabBar` 가 넘겨주는 state 중 쓰는 부분만. */
  state: { index: number; routes: { name: string }[] };
}

/**
 * `(tabs)` 네비게이터의 고정 탭 바. 화면은 `shift` 로 움직이고 이 바는 제자리에 있다.
 * 아래쪽 SafeArea 와 여백(pb-[10px])을 여기서 한 번만 먹는다.
 */
export default function BottomTabBar({ state }: BottomTabBarProps) {
  const routeName = state.routes[state.index]?.name ?? 'index';
  const active = ROUTE_TO_ITEM[routeName] ?? 'home';

  return (
    <Screen edges={['bottom']} className="bg-default-bg pb-[10px]">
      <BottomNav active={active} />
    </Screen>
  );
}
