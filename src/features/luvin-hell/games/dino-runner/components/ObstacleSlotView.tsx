import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import BreadCharacter, { type BreadType } from '@/src/assets/images/BreadCharacter';
import {
  AIR_OBSTACLE_HEIGHT,
  AIR_OBSTACLE_Y,
  FRAME_HEIGHT,
  GROUND_OBSTACLE_HEIGHT,
  GROUND_Y,
  OBSTACLE_WIDTH,
} from '@/src/features/luvin-hell/games/dino-runner/engine/constants';
import { AIR_KIND, GROUND_KIND } from '@/src/features/luvin-hell/games/dino-runner/engine/pool';

interface ObstacleSlotViewProps {
  x: SharedValue<number>;
  kindFlag: SharedValue<number>;
  /** 스폰마다 랜덤 배정되는 반죽 종류(다양화) — 지상/공중 스프라이트 둘 다 같은 값을 쓴다(둘 중 하나만 보임). */
  doughType: BreadType;
}

/**
 * 반죽 이미지 크기는 고정 px 로 준다. 예전엔 `h-full w-full`(부모 비율)이었는데, 납작화 같은 이유로
 * 부모가 박스가 아닌 다른 뷰로 잡히면 반죽이 땅 속(약 42px 아래)에 박혀 그려지거나 아예 크기 0 으로
 * 안 보였다(시뮬레이터 녹화에서 가끔 재현). 비율 대신 고정 크기면 부모가 누구든 같은 크기로 그려진다.
 */
const GROUND_DOUGH_SIZE = { width: OBSTACLE_WIDTH, height: GROUND_OBSTACLE_HEIGHT };
const AIR_DOUGH_SIZE = { width: OBSTACLE_WIDTH, height: AIR_OBSTACLE_HEIGHT };

/**
 * 오브젝트 풀의 슬롯 하나. 지상/공중 스프라이트를 항상 둘 다 마운트해두고 kindFlag로
 * opacity만 토글한다 — 리마운트·키 변경 없이 스포닝을 표현한다(엔진 아키텍처 3번 참고).
 * 순수 reanimated Animated.View + style만 쓴다(className 섞으면 실기기에서 크기가 깨짐 — PlayerSprite 주석 참고).
 */
export default function ObstacleSlotView({ x, kindFlag, doughType }: ObstacleSlotViewProps) {
  const wrapperStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const groundStyle = useAnimatedStyle(() => ({ opacity: kindFlag.value === GROUND_KIND ? 1 : 0 }));
  const airStyle = useAnimatedStyle(() => ({ opacity: kindFlag.value === AIR_KIND ? 1 : 0 }));

  // 지상/공중 박스는 레이아웃+opacity 만 있어서 새 아키텍처(Fabric)가 뷰를 납작하게 합쳐 버린다
  // (view flattening). 그러면 안의 이미지(h-full)가 이 박스가 아닌 다른 기준으로 크기를 잡아
  // 반죽이 박스보다 42px 아래, 흙 속에 그려졌다(시뮬레이터에서 확인 — 박스에 배경색만 줘도
  // 정상 위치로 돌아왔다). collapsable={false} 로 박스를 실제 뷰로 남긴다.
  return (
    // 바깥 래퍼에도 실제 크기를 준다 — 크기 0 래퍼는 납작화돼 사라지기 쉽고, 그러면 안쪽 박스의
    // top 이 엉뚱한 기준으로 계산될 수 있다.
    <Animated.View
      collapsable={false}
      pointerEvents="none"
      style={[{ position: 'absolute', top: 0, left: 0, width: OBSTACLE_WIDTH, height: FRAME_HEIGHT }, wrapperStyle]}
    >
      <Animated.View
        collapsable={false}
        style={[
          { position: 'absolute', top: GROUND_Y - GROUND_OBSTACLE_HEIGHT, width: OBSTACLE_WIDTH, height: GROUND_OBSTACLE_HEIGHT },
          groundStyle,
        ]}
      >
        {/* 반죽 PNG가 박스보다 납작해서 가운데 정렬이면 땅에서 떠 보인다 — 바닥에 붙인다. */}
        <BreadCharacter type={doughType} state="dough" style={GROUND_DOUGH_SIZE} contentPosition="bottom" />
      </Animated.View>
      <Animated.View
        collapsable={false}
        style={[
          { position: 'absolute', top: AIR_OBSTACLE_Y, width: OBSTACLE_WIDTH, height: AIR_OBSTACLE_HEIGHT },
          airStyle,
        ]}
      >
        <BreadCharacter type={doughType} state="dough" style={AIR_DOUGH_SIZE} />
      </Animated.View>
    </Animated.View>
  );
}
