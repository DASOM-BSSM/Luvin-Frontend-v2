import '@/global.css';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { colorScheme } from 'nativewind';
import { useEffect } from 'react';

// 컴포넌트 밖(모듈 스코프)에서 호출해야 한다. 훅 안에서 부르면 이미 늦은 경우가 있다.
SplashScreen.preventAutoHideAsync();

// Figma 의 Color system 컬렉션은 모드가 하나뿐이라 다크 팔레트가 없다.
// app.json 의 userInterfaceStyle 이 "automatic" 이므로 라이트로 고정한다.
colorScheme.set('light');

export default function RootLayout() {
  // 키 이름이 곧 RN 의 fontFamily 값이다.
  // tailwind.config.js 의 fontFamily / src/constants/typography.ts 와 반드시 일치해야 한다.
  const [loaded, error] = useFonts({
    YdestreetB: require('@/src/assets/fonts/YdestreetB.ttf'),
    YdestreetL: require('@/src/assets/fonts/YdestreetL.ttf'),
  });

  useEffect(() => {
    // 폰트 로드에 실패해도 스플래시에 갇히지 않게 error 도 함께 본다.
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return <Stack />;
}
