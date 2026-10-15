import { body } from '@/src/constants/typography';

/**
 * 러빈지옥 대화를 화면 높이에 맞춰 쪽으로 나눌 때 쓰는 치수(utils/paginate-chat 참고).
 *
 * 여기 숫자는 새 디자인 값이 아니라, 실제로 대화를 그리는 컴포넌트의 className 값을 그대로
 * 옮겨 적은 것이다. 그쪽 className 을 바꾸면 여기도 같이 바꿔야 계산이 맞는다 — 각 값 옆에
 * 어느 컴포넌트의 어느 클래스인지 적어 둔다.
 */

/** 위아래 바 높이. inferno-top-bar / inferno-bottom-bar 의 `h-[51px]`. */
export const INFERNO_BAR_HEIGHT = 51;

/**
 * 대화 블록 위아래에 꼭 남겨 둘 여백. 시안 값이 아니라 사용자 요청으로 정한 값 —
 * 대화가 이 여백을 침범할 것 같으면 다음 쪽으로 넘긴다.
 */
export const CHAT_VERTICAL_PADDING = 20;

/** 말풍선 글자 한 줄 높이. TypewriterText `body-m`. */
export const CHAT_TEXT_LINE_HEIGHT = body.m.lineHeight;

/** 말풍선 글자 크기. 글자 폭을 어림할 때 쓴다. */
export const CHAT_TEXT_FONT_SIZE = body.m.fontSize;

/** 말풍선 위아래/좌우 안쪽 여백 합. inferno-chat-bubble 의 `py-[10px]`, `px-[20px]`. */
export const CHAT_BUBBLE_PADDING_Y = 10 * 2;
export const CHAT_BUBBLE_PADDING_X = 20 * 2;

/** 전체대화(InfernoChatScene) 치수. */
export const GROUP_CHAT_LAYOUT = {
  /** 좌우 여백 합. inferno-chat-scene 의 `px-[50px]`. */
  horizontalPadding: 50 * 2,
  /** 반죽 칸 + 반죽과 말풍선 사이. dough-figures 의 `w-[107px]`, `gap-[12px]`. */
  avatarSlotWidth: 107 + 12,
  /** 가장 큰 반죽 높이. dough-figures 의 chatSizeClass 중 최대(`h-[72px]`). */
  avatarHeight: 72,
  /** 말풍선 위 이름표(`body-xxs`) + 이름표와 말풍선 사이(`gap-[4px]`). inferno-chat-row. */
  nameLabelHeight: body.xxs.lineHeight + 4,
  /** 줄 사이. inferno-chat-scene 의 `gap-[16px]`. */
  rowGap: 16,
  /** 첫 쪽 질문 블록: `h-[12px]` + 질문(`body-m`) + `h-[10px]`. */
  questionHeight: 12 + body.m.lineHeight + 10,
  /** 질문이 없을 때의 윗 칸. `h-[8px]`. */
  noQuestionTopHeight: 8,
};

/** 1:1 대화(InfernoPersonalChatScene) 치수. */
export const PERSONAL_CHAT_LAYOUT = {
  /** 왼쪽 사이드바 + 오른쪽 여백. inferno-personal-chat-sidebar `w-[300px]`, scene `pr-[40px]`. */
  reservedWidth: 300 + 40,
  /** 대화 위 칸. inferno-personal-chat-scene 의 `h-[25px]`. */
  topHeight: 25,
  /** 줄 사이. inferno-personal-chat-scene 의 `gap-[20px]`. */
  rowGap: 20,
};

/**
 * 글자 폭 비율(글자 크기 대비). `YdestreetL.ttf` 의 hmtx(advance width)를 직접 읽어 잰 값이다
 * (unitsPerEm 1000) — 한글은 모두 1.000, 영문·숫자는 평균 0.797·최대 1.155, 공백 0.28.
 * 영문은 평균보다 조금 넓게(0.85) 잡아 대문자가 몰려도 넘치지 않게 한다.
 */
export const CHAT_GLYPH_WIDTH_RATIO = {
  /** 한글, 한자, 이모지 등. */
  wide: 1,
  /** 영문, 숫자. */
  latin: 0.85,
  space: 0.28,
  /** 자주 나오는 문장부호는 폰트 값 그대로. 목록에 없는 기호는 latin 으로 본다. */
  punctuation: {
    '.': 0.24,
    ',': 0.24,
    '!': 0.33,
    '?': 0.76,
    '~': 0.74,
    '…': 0.845,
    "'": 0.3,
    '"': 0.47,
    '(': 0.45,
    ')': 0.45,
    '-': 0.68,
    ':': 0.3,
    ';': 0.3,
  } as Record<string, number>,
};

/**
 * 한 줄 폭 중 실제로 채운다고 볼 몫. 단어 단위 줄바꿈은 계산에서 직접 흉내 내므로(paginate-chat),
 * 여기는 렌더링 오차만 덮는 작은 여유다.
 */
export const CHAT_LINE_FILL_RATIO = 0.97;
