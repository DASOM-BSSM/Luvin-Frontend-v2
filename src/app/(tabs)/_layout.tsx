import { Tabs } from 'expo-router';

import BottomTabBar from '@/src/components/bottom-tab-bar';

/** Tabs 의 `tabBar` 가 넘겨주는 props 중 쓰는 부분만. */
interface TabBarRenderProps {
  state: { index: number; routes: { name: string }[] };
}

/**
 * `tabBar` 는 컴포넌트가 아니라 일반 함수로 호출된다. React Compiler 가 컴포넌트 안에 넣는 훅이
 * 이 호출 자리에서 깨지므로(Invalid hook call), 엘리먼트로 한 번 감싸 컴포넌트로 그리게 한다.
 */
function renderTabBar(props: TabBarRenderProps) {
  return <BottomTabBar state={props.state} />;
}

/**
 * 하단 탭 4개(홈 · 오븐 · 감정일기 · 내 성향)의 네비게이터.
 *
 * `(tabs)` 는 그룹이라 URL 에 나타나지 않는다 — `/`, `/oven`, `/diaries`, `/bread` 경로는 그대로다.
 * `shift` 는 탭 순서에 따라 화면이 좌/우로 밀려 들어오는 전환이다. 탭 바는 고정이고 화면만 움직인다.
 */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        animation: 'shift',
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="oven" />
      <Tabs.Screen name="diaries" />
      <Tabs.Screen name="bread" />
    </Tabs>
  );
}
