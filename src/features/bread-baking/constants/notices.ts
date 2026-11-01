import type { BakingNotice, BakingOvenResult } from '@/src/features/bread-baking/types';

/** NOTICE copy, Figma 8025:3848 / 3855 / 3862 / 3869 / 3876 / 3883 and 7958:5971. */
export const BAKING_NOTICE_MESSAGES: Record<BakingNotice, string> = {
  'flour-first': '밀가루부터 넣어주세요!',
  'mix-flour-eggs': '밀가루와 계란 먼저 섞어야해요!',
  'butter-first': '버터부터 넣어주세요!',
  'mix-butter-water': '버터와 물 먼저 섞어야해요!',
  'salt-first': '소금부터 순서대로 넣어주세요!',
  'butter-filling': '밀어낸 반죽에 버터를 넣어야해요!',
  'sprinkle-salt': '반죽 위에 소금을 뿌려주세요!',
};

/** FAIL copy for a loaf that left the oven too late or too early, Figma 7962:6094 / 7962:6101. */
export const BAKING_OVEN_FAIL_MESSAGES: Record<Exclude<BakingOvenResult, 'baked'>, string> = {
  burnt: '소금빵이 다 탔잖아요!!!!!!!!!',
  raw: '소금빵이 다 안 익었잖아요.....',
};

/** Note for a loaf pulled in the green zone (Figma 8025:3848 layout, copy from the user 2026-11-02). */
export function getBakedNoticeMessage(bakedCount: number, targetCount: number): string {
  return `소금빵이 맛있게 구워졌어요! (${bakedCount}/${targetCount})`;
}
