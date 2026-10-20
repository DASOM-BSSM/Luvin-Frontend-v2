import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';

import LandscapeOnly from '@/src/components/landscape-only';
import InfernoIntroCard from '@/src/features/inferno/components/inferno-intro-card';
import { infernoEpisodeHref } from '@/src/features/inferno/constants/routes';
import useViewedSeason from '@/src/features/inferno/hooks/use-viewed-season';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';

/** 회차를 넘기지 않고 들어왔을 때 보여줄 회차. 기존 `/inferno` 링크는 ep0 로 남는다. */
const DEFAULT_ORDER = 0;

/**
 * 러빈지옥 회차 시작 화면. Figma `ep0-시작` (6159:3315), `ep1-시작` (5397:4269).
 *
 * 회차마다 시작 화면이 똑같고 하단 알약의 제목만 달라서 화면을 하나만 두고 회차를
 * 검색 파라미터로 받는다(`/inferno?order=1`). 회차별로 파일을 늘리면 같은 화면이 복사된다.
 *
 * 가로 잠금과 상태바 숨김은 경로를 보고 루트 레이아웃이 맡는다(use-landscape-routes).
 *
 * SafeArea 를 쓰지 않는다. 가로에서 왼쪽에 오는 카메라 컷아웃 인셋이 카드 폭을 48 줄이고
 * 한쪽으로 밀어서 시안 비율(카드가 화면을 꽉 채우고 여백이 좌우 대칭)이 깨지기 때문이다.
 *
 * 인트로는 따로 버튼이 없고 화면 아무 곳이나 누르면 본문으로 넘어간다.
 * 본문부터는 상단 바의 `다음화면 >` 로만 이동한다.
 */
export default function InfernoScreen() {
  const { order } = useLocalSearchParams<{ order?: string }>();
  // 지난 시즌 다시 보기면 시즌을 본문으로 그대로 넘긴다(constants/routes 의 infernoIntroHref).
  const { pastSeasonId } = useViewedSeason();

  // 파라미터는 문자열이고 사용자가 딥링크로 아무 값이나 넣을 수 있다. 숫자가 아니면 ep0 로 본다(§13).
  const parsedOrder = Number.parseInt(order ?? '', 10);
  const episodeOrder = Number.isNaN(parsedOrder) ? DEFAULT_ORDER : parsedOrder;

  const episode = findInfernoEpisode(episodeOrder);

  // 없는 회차로 들어온 경우. 빈 화면에 가두지 않고 돌려보낸다.
  if (!episode) {
    return null;
  }

  function handleScreenPress() {
    const href = infernoEpisodeHref(episodeOrder, pastSeasonId);

    // 본문이 아직 없는 회차라면 시작 화면에 머문다.
    if (!href) {
      return;
    }

    router.push(href);
  }

  // 세로로 돌아가는 순간에는 감춘다(LandscapeOnly 주석 참고).
  return (
    <LandscapeOnly>
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
    </LandscapeOnly>
  );
}
