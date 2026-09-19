import '@/global.css';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { colorScheme } from 'nativewind';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import theme from '@/src/constants/theme';
import useLandscapeRoutes from '@/src/hooks/use-landscape-routes';

// 컴포넌트 밖(모듈 스코프)에서 호출해야 한다. 훅 안에서 부르면 이미 늦은 경우가 있다.
SplashScreen.preventAutoHideAsync();

// 색상 팔레트에 모드가 하나뿐이라 다크 팔레트가 없다.
// app.json 의 userInterfaceStyle 이 "automatic" 이므로 라이트로 고정한다.
//
// 네이티브에서만 부르는 이유: NativeWind 의 web 구현은 이 호출을 두 군데서 막는다.
//   1) darkMode 가 'media' 라서 (기본값) -> 브라우저에서 throw
//   2) web.output 이 "static" 이라 Node 로 미리 렌더할 때 window 가 없어서 -> SSR 에서 throw
// 네이티브 구현은 Appearance.setColorScheme 만 부르고 throw 하지 않는다.
// 타깃은 iOS/Android 이고 dark: 변형도 쓰지 않으므로 웹은 그냥 라이트로 렌더된다.
if (Platform.OS !== 'web') {
  colorScheme.set('light');
}

export default function RootLayout() {
  // 키 이름이 곧 RN 의 fontFamily 값이다.
  // tailwind.config.js 의 fontFamily / src/constants/typography.ts 와 반드시 일치해야 한다.
  const [loaded, error] = useFonts({
    YdestreetB: require('@/src/assets/fonts/YdestreetB.ttf'),
    YdestreetL: require('@/src/assets/fonts/YdestreetL.ttf'),
    OkMallangBRegular: require('@/src/assets/fonts/OkMallangB-Regular.ttf'),
  });

  // 화면 방향과 상태바는 지금 경로를 보고 이 훅이 한 곳에서 정한다.
  // app.json 의 orientation 이 "default" 인 것도 그래서다(자세한 이유는 훅 주석 참고).
  useLandscapeRoutes();

  useEffect(() => {
    // 폰트 로드에 실패해도 스플래시에 갇히지 않게 error 도 함께 본다.
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      {/* 밝은 배경 위 어두운 글씨. */}
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          // 화면 헤더는 각 시안이 직접 그리므로 네비게이터 헤더는 쓰지 않는다.
          headerShown: false,
          // 전환 중 흰색이 비치지 않도록 기본 배경을 토큰 색으로 맞춘다.
          contentStyle: { backgroundColor: theme.colors.default.bg },
        }}
      />
    </>
  );
}
