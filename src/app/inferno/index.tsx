import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import InfernoIntroCard from '@/src/features/inferno/components/inferno-intro-card';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';

/** 이 화면이 보여주는 회차. 회차별 라우트가 생기면 파라미터로 바뀔 자리다. */
const INTRO_ORDER = 0;

/**
 * 러빈지옥 ep0 시작 화면. Figma `ep0-시작` (6159:3315).
 *
 * 가로 잠금과 상태바 숨김은 묶음 레이아웃(_layout.tsx)이 맡는다.
 *
 * SafeArea 를 쓰지 않는다. 가로에서 왼쪽에 오는 카메라 컷아웃 인셋이 카드 폭을 48 줄이고
 * 한쪽으로 밀어서 시안 비율(카드가 화면을 꽉 채우고 여백이 좌우 대칭)이 깨지기 때문이다.
 * 상태바는 묶음 레이아웃이 숨긴다.
 *
 * 인트로는 따로 버튼이 없고 화면 아무 곳이나 누르면 본문으로 넘어간다.
 * 본문부터는 상단 바의 `다음화면 >` 로만 이동한다.
 */
export default function InfernoScreen() {
  const episode = findInfernoEpisode(INTRO_ORDER);

  // 상수 목록에서 찾는 것이라 실제로는 비어 있을 수 없다. 타입을 좁히기 위한 처리.
  if (!episode) {
    return null;
  }

  function handleScreenPress() {
    router.push('/inferno/ep0');
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="러빈지옥 시작하기"
      className="flex-1 bg-default-white"
      onPress={handleScreenPress}
    >
      <View className="flex-1 px-[29px] py-[22px]">
        <InfernoIntroCard episode={episode} />
      </View>
    </Pressable>
  );
}
