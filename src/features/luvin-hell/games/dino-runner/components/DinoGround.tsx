import { View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { sceneColors } from '@/src/features/luvin-hell/constants/scene-colors';
import {
  GROUND_STACK_HEIGHT,
  GROUND_TILE_WIDTH,
} from '@/src/features/luvin-hell/games/dino-runner/engine/constants';

interface GroundPatch {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Figma 미니게임1(`5913:5154`)의 흙바닥 패치 8개. 화면마다(플레이/준비/설명) 동일한 좌표라
 * 랜덤 생성 대신 고정 배열로 둔다 — 흙바닥(dirt base) 자신의 좌상단 기준 좌표.
 */
const GROUND_PATCHES: readonly GroundPatch[] = [
  { left: 3, top: 24, width: 52, height: 12 },
  { left: 43, top: 45, width: 43, height: 12 },
  { left: 254, top: 24, width: 36, height: 12 },
  { left: 86, top: 27, width: 33, height: 12 },
  { left: 124, top: 45, width: 52, height: 12 },
  { left: 170, top: 18, width: 43, height: 12 },
  { left: 206, top: 42, width: 38, height: 12 },
  { left: 281, top: 51, width: 62, height: 12 },
];

/**
 * 전체 땅 스택(밝은 잔디+어두운 잔디+흙바닥)의 높이는 엔진 `GROUND_STACK_HEIGHT`를 그대로 쓴다 —
 * 엔진 `GROUND_Y`(잔디 윗면)와 그림이 항상 같은 값에서 나오도록 한 곳에서만 정의한다.
 */
interface DinoGroundProps {
  /**
   * 누적 생존거리(px). 주면 흙바닥 패치가 장애물과 같은 속도로 왼쪽으로 흘러 앞으로 달리는 것처럼
   * 보인다. `about.tsx` 미리보기처럼 안 주면 Figma 그대로 멈춰 있다.
   */
  distance?: SharedValue<number>;
}

/** 흙바닥 패치 한 벌. 스크롤할 때 두 벌을 이어 붙여 끊김 없이 반복한다. */
const GroundPatchTile = ({ offset }: { offset: number }) => (
  <>
    {GROUND_PATCHES.map((patch, index) => (
      <View
        key={index}
        className="absolute"
        style={{
          left: offset + patch.left,
          top: patch.top,
          width: patch.width,
          height: patch.height,
          backgroundColor: sceneColors.groundDark,
        }}
      />
    ))}
  </>
);

/**
 * 공룡빵게임 배경의 땅: 밝은 잔디 / 어두운 잔디 / 흙바닥(+흙바닥 위 패치 8개), 위에서
 * 아래 순서로 4겹. `DinoRunnerScene`과 `about.tsx` 미리보기가 공유한다.
 * 부모가 `relative` 컨테이너여야 한다(GameFrame / DinoRunnerScene 루트가 이미 그렇다).
 * 잔디 두 겹은 단색이라 움직여도 티가 안 나서, 흐르는 건 흙바닥 패치뿐이다.
 */
export default function DinoGround({ distance }: DinoGroundProps) {
  // 움직이는 요소는 className 없이 style 만 쓴다(PlayerSprite 주석 참고).
  const scrollStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: distance ? -(distance.value % GROUND_TILE_WIDTH) : 0 }],
  }));

  return (
    <View className="absolute bottom-0 left-0 right-0" style={{ height: GROUND_STACK_HEIGHT }}>
      <View className="h-[7px] w-full" style={{ backgroundColor: sceneColors.grass }} />
      <View className="h-[18px] w-full" style={{ backgroundColor: sceneColors.grassDark }} />
      <View className="relative flex-1 w-full overflow-hidden" style={{ backgroundColor: sceneColors.ground }}>
        <Animated.View
          style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, width: GROUND_TILE_WIDTH * 2 }, scrollStyle]}
        >
          <GroundPatchTile offset={0} />
          <GroundPatchTile offset={GROUND_TILE_WIDTH} />
        </Animated.View>
      </View>
    </View>
  );
}
