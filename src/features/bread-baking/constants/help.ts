import type { BakingStep } from '@/src/features/bread-baking/types';

export interface BakingHelpPage {
  /** Game step whose scene is drawn, dimmed, behind the bubbles. */
  step: BakingStep;
  bubbles: string[];
  /** Bubble column width in Figma, which differs per page. */
  bubbleWidthClass: string;
}

/**
 * 다솜이의 소금빵게임 설명 4쪽. Figma 6285:7219 → 8026:3925 → 8026:3990 → 8026:4121.
 * 첫 쪽 문구는 시안의 "1분·2개" 대신 실제 규칙(3분·3개)에 맞췄다(사용자 결정, 2026-11-01).
 */
export const BAKING_HELP_PAGES: readonly BakingHelpPage[] = [
  {
    step: 'mix-final',
    bubbles: [
      '3분 안에 소금빵 3개를\n모두 만들어서 팔아야해요!',
      '빵이 타거나 덜 익으면\n미션에 들어가지 않아요!!!!!',
    ],
    bubbleWidthClass: 'w-[211px]',
  },
  {
    step: 'mix-final',
    bubbles: [
      '1. 밀가루, 계란을 넣고 섞어요\n2. 버터, 물을 넣고 섞어요\n3. 소금, 설탕, 이스트 순서로\n넣고 섞어요\n4. 도마 위에 반죽을 올려요',
    ],
    bubbleWidthClass: 'w-[223px]',
  },
  {
    step: 'roll',
    bubbles: [
      '5. 밀대로 반죽을 밀어요\n6. 반죽 안에 버터를 넣어요\n7. 화살표 모양대로 반죽을\n소금빵 모양으로 성형해요\n8. 반죽 위에 소금을 뿌려요',
    ],
    bubbleWidthClass: 'w-[211px]',
  },
  {
    step: 'load',
    bubbles: [
      '9. 반죽을 오븐 안에 넣어요\n10. 오븐 위에 뜨는 타이머가\n초록불 안에 들어올때!!\n오븐을 정확하게 눌러요\n11. 다시 소금빵을 구워요...',
    ],
    bubbleWidthClass: 'w-[217px]',
  },
];
