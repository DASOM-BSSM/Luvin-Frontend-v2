import type { BreadType } from '@/src/assets/images/BreadCharacter';

/** 반죽 한 마리가 러빈지옥 화면에서 차지하는 자리. */
export interface InfernoDoughFigure {
  /** 대화 줄의 아바타 크기. 줄 높이도 이 값에서 나온다(말풍선 46보다 늘 크다). */
  chatSizeClass: string;
  /** 대화 줄에서 말풍선과 아바타 사이. 반죽마다 다르다. */
  chatGapClass: string;
  /** 투표지 선택지의 작은 그림 크기. 폭은 50 으로 같고 높이만 반죽 비율을 따른다. */
  optionSizeClass: string;
}

/**
 * 반죽별 크기표. Figma `ep1-전체대화`(5425:886), `ep1-전체대화 끝`(6137:2782),
 * `ep1-투표지`(5452:1989) 의 인스턴스에서 잰 값.
 *
 * 시안에 나온 네 마리만 값이 있다. 다른 반죽이 대화에 끼면 그때 Figma 에서 크기를 확인해
 * 여기에 추가할 것(§8).
 *
 * 소금빵의 optionSizeClass 는 시안에 없다. 소금빵은 내 분신이라 투표 선택지에 뜨지 않기
 * 때문이고, 표를 비워 두지 않으려고 대화 아바타 비율(107x59)을 폭 50 에 맞춰 넣어 뒀다.
 */
export const INFERNO_DOUGH_FIGURES: Partial<Record<BreadType, InfernoDoughFigure>> = {
  salt: {
    chatSizeClass: 'h-[59px] w-[107px]',
    chatGapClass: 'gap-[24px]',
    optionSizeClass: 'h-[28px] w-[50px]',
  },
  donut: {
    chatSizeClass: 'h-[72px] w-[84px]',
    chatGapClass: 'gap-[12px]',
    optionSizeClass: 'h-[43px] w-[50px]',
  },
  pretzel: {
    chatSizeClass: 'h-[65px] w-[87px]',
    chatGapClass: 'gap-[24px]',
    optionSizeClass: 'h-[37px] w-[50px]',
  },
  castella: {
    chatSizeClass: 'h-[67px] w-[86px]',
    chatGapClass: 'gap-[12px]',
    optionSizeClass: 'h-[38px] w-[50px]',
  },
};

/** 시안에 없는 반죽이 나왔을 때 쓰는 임시 값. 실제 값이 나오면 위 표에 넣을 것. */
export const FALLBACK_DOUGH_FIGURE: InfernoDoughFigure = {
  chatSizeClass: 'h-[65px] w-[87px]',
  chatGapClass: 'gap-[24px]',
  optionSizeClass: 'h-[37px] w-[50px]',
};

/** 반죽 크기를 찾는다. 표에 없으면 임시 값. */
export function findDoughFigure(type: BreadType): InfernoDoughFigure {
  return INFERNO_DOUGH_FIGURES[type] ?? FALLBACK_DOUGH_FIGURE;
}
