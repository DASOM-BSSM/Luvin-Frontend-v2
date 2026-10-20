import { View } from 'react-native';

import { sceneColors } from '@/src/features/luvin-hell/constants/scene-colors';
import { GROUND_STACK_HEIGHT } from '@/src/features/luvin-hell/games/dino-runner/engine/constants';

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
/**
 * 공룡빵게임 배경의 땅: 밝은 잔디 / 어두운 잔디 / 흙바닥(+흙바닥 위 패치 8개), 위에서
 * 아래 순서로 4겹. `DinoRunnerScene`과 `about.tsx` 미리보기가 공유한다.
 * 부모가 `relative` 컨테이너여야 한다(GameFrame / DinoRunnerScene 루트가 이미 그렇다).
 */
export default function DinoGround() {
  return (
    <View className="absolute bottom-0 left-0 right-0" style={{ height: GROUND_STACK_HEIGHT }}>
      <View className="h-[7px] w-full" style={{ backgroundColor: sceneColors.grass }} />
      <View className="h-[18px] w-full" style={{ backgroundColor: sceneColors.grassDark }} />
      <View className="relative flex-1 w-full overflow-hidden" style={{ backgroundColor: sceneColors.ground }}>
        {GROUND_PATCHES.map((patch, index) => (
          <View
            key={index}
            className="absolute"
            style={{
              left: patch.left,
              top: patch.top,
              width: patch.width,
              height: patch.height,
              backgroundColor: sceneColors.groundDark,
            }}
          />
        ))}
      </View>
    </View>
  );
}
