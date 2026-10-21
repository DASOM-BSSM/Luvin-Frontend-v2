import type { SharedValue } from 'react-native-reanimated';

import BreadCharacter from '@/src/assets/images/BreadCharacter';
import InfernoBakeFigure from '@/src/features/inferno/components/inferno-bake-figure';
import { findDoughFigure } from '@/src/features/inferno/constants/dough-figures';
import type { InfernoFinalMatchProfile } from '@/src/features/inferno/types';

interface InfernoFinalMatchFigureProps {
  profile: InfernoFinalMatchProfile;
  side: -1 | 1;
  reveal?: SharedValue<number>;
}

/**
 * ep5 1페이지·다시 보기 결과 장면(InfernoFinalMatchScene)의 한 마리. 굽기 연출 시계(`reveal`)를 넘기면 반죽 →
 * 구운 빵으로 바뀌는 연출 한 마리(InfernoBakeFigure), 아니면 personDough 정지 그림이다.
 */
export default function InfernoFinalMatchFigure({ profile, side, reveal }: InfernoFinalMatchFigureProps) {
  // 연출과 정지 화면이 같은 칸(chatSizeClass)을 쓴다 — 크기 기준은 이 한 곳이다.
  const sizeClass = findDoughFigure(profile.type).chatSizeClass;

  if (reveal) {
    return (
      <InfernoBakeFigure
        type={profile.type}
        sizeClass={sizeClass}
        side={side}
        time={reveal}
        accessibilityLabel={profile.name}
      />
    );
  }
  return (
    <BreadCharacter
      type={profile.type}
      state="personDough"
      className={sizeClass}
      accessibilityLabel={profile.name}
    />
  );
}
