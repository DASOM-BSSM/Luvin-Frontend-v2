/**
 * [DRAFT] 나이 선택 범위. 시안이 없어 임시로 정한 값이다.
 * 나이로 러빈지옥 시즌 배경이 정해진다(19세 이하 학교 / 20~23세 대학·아르바이트 / 24세 이상 회사).
 */
export const MIN_AGE = 14;
export const MAX_AGE = 40;
/** 아직 나이가 없을 때 처음 +/− 를 누르면 여기서 시작한다. */
export const START_AGE = 20;

export function stepAge(age: number | undefined, step: 1 | -1): number {
  const next = age === undefined ? START_AGE : age + step;
  return Math.min(MAX_AGE, Math.max(MIN_AGE, next));
}

/** 서버 나이가 범위 밖(0 등 비어 있음을 뜻하는 값)이면 없는 것으로 본다. */
export function toKnownAge(age: number | null | undefined): number | undefined {
  return age !== null && age !== undefined && age >= MIN_AGE && age <= MAX_AGE ? age : undefined;
}
