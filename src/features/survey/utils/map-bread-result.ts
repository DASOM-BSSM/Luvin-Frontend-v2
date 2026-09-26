import type { BreadType } from '@/src/assets/images/BreadCharacter';
import type { BreadProfile } from '@/src/features/home/types';
import type { BreadCanonicalType, SurveyResult } from '@/src/features/survey/types';

/** FRONTEND_CHANGES.md §6 매핑표. 서버 canonical ID → 화면 BreadType. */
const CANONICAL_TO_BREAD_TYPE: Record<BreadCanonicalType, BreadType> = {
  cream_bread: 'cream',
  red_bean_bread: 'redbean',
  salt_bread: 'salt',
  pretzel: 'pretzel',
  donut: 'donut',
  baguette: 'baguette',
  madeleine: 'madeleine',
  castella: 'castella',
};

/**
 * 서버 결과를 화면이 쓰는 `BreadProfile`로 바꾼다. 순수 함수(§6).
 *
 * 모르는 canonical 코드는 salt 로 fallback하지 않고 `null` — 화면이 "결과를 불러올 수
 * 없음"으로 처리해야 한다(§6). `state`는 항상 'dough'다 — 설문 결과와 시뮬레이션의
 * dough/baked 진행 상태는 별개라, 설문만 마쳤다고 baked로 올리지 않는다.
 */
export function mapSurveyResultToBreadProfile(result: SurveyResult): BreadProfile | null {
  const type = CANONICAL_TO_BREAD_TYPE[result.primaryType];
  if (!type) {
    return null;
  }

  return {
    type,
    state: 'dough',
    name: result.displayName,
    description: result.summary,
  };
}
