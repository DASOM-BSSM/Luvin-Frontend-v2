import {
  CHAT_BUBBLE_PADDING_X,
  CHAT_BUBBLE_PADDING_Y,
  CHAT_GLYPH_WIDTH_RATIO,
  CHAT_LINE_FILL_RATIO,
  CHAT_TEXT_FONT_SIZE,
  CHAT_TEXT_LINE_HEIGHT,
  CHAT_VERTICAL_PADDING,
  GROUP_CHAT_LAYOUT,
  INFERNO_BAR_HEIGHT,
  PERSONAL_CHAT_LAYOUT,
} from '@/src/features/inferno/constants/chat-layout';

/**
 * 대화 한 쪽에 무엇이 얼마나 들어가는지. 화면 크기에서 계산한다(buildChatPageBudgets).
 *
 * 순수 값만 담아서 map-ai-episode 같은 순수 함수에 그대로 넘길 수 있다(§6).
 */
export interface ChatPageBudget {
  /** 한 쪽에 대화 줄들이 쓸 수 있는 높이(위아래 여백, 질문 칸을 빼기 전). */
  availableHeight: number;
  /** 말풍선 글자가 한 줄에 쓸 수 있는 폭. */
  textWidth: number;
  /** 줄 사이 간격. */
  rowGap: number;
  /** 첫 쪽에 질문이 있을 때 질문 블록이 차지하는 높이. */
  questionHeight: number;
  /** 질문이 없는 쪽의 위 칸 높이. */
  topHeight: number;
  /** 말풍선 글자 줄 수 → 대화 한 줄(반죽·이름표 포함) 높이. */
  rowHeight: (lineCount: number) => number;
}

export interface ChatPageBudgets {
  /** 전체대화(InfernoChatScene). */
  group: ChatPageBudget;
  /** 매칭 뒤 1:1 대화(InfernoPersonalChatScene). 왼쪽 사이드바만큼 폭이 좁다. */
  personal: ChatPageBudget;
}

function bubbleHeight(lineCount: number): number {
  return lineCount * CHAT_TEXT_LINE_HEIGHT + CHAT_BUBBLE_PADDING_Y;
}

/** 화면(창) 크기에서 쪽 예산을 만든다. 러빈지옥은 가로로 잠겨 있어 width > height 다. */
export function buildChatPageBudgets(windowWidth: number, windowHeight: number): ChatPageBudgets {
  const availableHeight = windowHeight - INFERNO_BAR_HEIGHT * 2;

  return {
    group: {
      availableHeight,
      textWidth:
        windowWidth -
        GROUP_CHAT_LAYOUT.horizontalPadding -
        GROUP_CHAT_LAYOUT.avatarSlotWidth -
        CHAT_BUBBLE_PADDING_X,
      rowGap: GROUP_CHAT_LAYOUT.rowGap,
      questionHeight: GROUP_CHAT_LAYOUT.questionHeight,
      topHeight: GROUP_CHAT_LAYOUT.noQuestionTopHeight,
      // 반죽이 말풍선 옆에 아래로 붙어 서서(items-end), 줄 높이는 둘 중 큰 쪽이다.
      rowHeight: (lineCount) =>
        Math.max(GROUP_CHAT_LAYOUT.avatarHeight, GROUP_CHAT_LAYOUT.nameLabelHeight + bubbleHeight(lineCount)),
    },
    personal: {
      availableHeight,
      textWidth: windowWidth - PERSONAL_CHAT_LAYOUT.reservedWidth - CHAT_BUBBLE_PADDING_X,
      rowGap: PERSONAL_CHAT_LAYOUT.rowGap,
      questionHeight: PERSONAL_CHAT_LAYOUT.topHeight,
      topHeight: PERSONAL_CHAT_LAYOUT.topHeight,
      rowHeight: bubbleHeight,
    },
  };
}

/** 한 글자 폭(px). 비율은 실제 폰트에서 잰 값이다(chat-layout 의 CHAT_GLYPH_WIDTH_RATIO). */
function glyphWidth(char: string): number {
  const { punctuation, space, latin, wide } = CHAT_GLYPH_WIDTH_RATIO;

  if (char === ' ') {
    return space * CHAT_TEXT_FONT_SIZE;
  }

  const punctuationRatio = punctuation[char];
  if (punctuationRatio !== undefined) {
    return punctuationRatio * CHAT_TEXT_FONT_SIZE;
  }

  const code = char.codePointAt(0) ?? 0;
  // ASCII 와 라틴 확장은 영문 폭, 그 밖(한글, 이모지, 전각 기호 등)은 넓은 글자로 본다.
  return (code < 0x0250 ? latin : wide) * CHAT_TEXT_FONT_SIZE;
}

function textWidthOf(text: string): number {
  return [...text].reduce((sum, char) => sum + glyphWidth(char), 0);
}

/**
 * 말풍선 안에서 이 말이 몇 줄이 될지 계산한다. 실제로 그려서 재는 대신, 폰트에서 잰 글자
 * 폭으로 단어 단위 줄바꿈을 그대로 흉내 낸다 — 다음 단어가 남은 폭에 안 들어가면 줄을
 * 넘기고, 한 단어가 한 줄보다 길면 그 단어를 글자 단위로 잘라 여러 줄을 쓴다.
 *
 * 플랫폼이 한글을 글자 단위로 끊으면 실제 줄 수는 이 값과 같거나 적다. 그래서 이 계산은
 * 줄을 적게 세서 넘치는 쪽으로는 틀리지 않는다.
 */
export function estimateLineCount(text: string, textWidth: number): number {
  const lineWidth = Math.max(textWidth * CHAT_LINE_FILL_RATIO, CHAT_TEXT_FONT_SIZE);
  const spaceWidth = glyphWidth(' ');

  return text.split('\n').reduce((total, paragraph) => {
    let lines = 1;
    let used = 0;

    paragraph
      .split(' ')
      .filter((word) => word.length > 0)
      .forEach((word) => {
        const wordWidth = textWidthOf(word);
        const widthWithSpace = used === 0 ? wordWidth : used + spaceWidth + wordWidth;

        if (widthWithSpace <= lineWidth) {
          used = widthWithSpace;
          return;
        }

        // 지금 줄에 안 들어가서 새 줄에서 시작한다. 그 단어 자체가 한 줄보다 길면 넘친 만큼 줄을 더 쓴다.
        if (used > 0) {
          lines += 1;
        }
        lines += Math.floor(wordWidth / lineWidth);
        used = wordWidth % lineWidth;
      });

    return total + lines;
  }, 0);
}

/**
 * 말들을 화면 높이에 맞춰 쪽으로 나눈다. 반환값은 각 쪽에 들어갈 말의 인덱스 범위
 * `[start, end)` 목록이다.
 *
 * 위아래 여백(CHAT_VERTICAL_PADDING)을 뺀 높이 안에 차례로 채우다가, 다음 말이 넘칠 것
 * 같으면 그 말부터 다음 쪽에 둔다. 한 말이 혼자서도 넘칠 만큼 길면 그 말만 한 쪽을 쓴다
 * (더 쪼갤 수 없어서).
 */
export function paginateByHeight(
  texts: string[],
  budget: ChatPageBudget,
  hasQuestionOnFirstPage: boolean,
): [number, number][] {
  const ranges: [number, number][] = [];
  const contentHeight = budget.availableHeight - CHAT_VERTICAL_PADDING * 2;

  let start = 0;
  let used = 0;

  texts.forEach((text, index) => {
    const isFirstOnPage = index === start;
    const headerHeight =
      ranges.length === 0 && hasQuestionOnFirstPage ? budget.questionHeight : budget.topHeight;
    const rowHeight = budget.rowHeight(estimateLineCount(text, budget.textWidth));
    const nextUsed = isFirstOnPage ? headerHeight + rowHeight : used + budget.rowGap + rowHeight;

    if (!isFirstOnPage && nextUsed > contentHeight) {
      ranges.push([start, index]);
      start = index;
      const nextHeader = budget.topHeight;
      used = nextHeader + rowHeight;
      return;
    }

    used = nextUsed;
  });

  if (texts.length > 0) {
    ranges.push([start, texts.length]);
  }

  return ranges;
}
