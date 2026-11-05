import { Stack } from 'expo-router';

/**
 * 감정일기 탭 안의 스택. 그룹 만들기/참여/방 같은 하위 화면이 탭 바를 유지한 채 쌓인다.
 * 화면 헤더는 각 시안이 직접 그린다.
 */
export default function DiariesLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
