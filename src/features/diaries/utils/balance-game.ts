/** Figma 감정일기 홈(5950:6585)의 밸런스 게임 질문 앞머리. */
const QUESTION_PREFIX = 'Q. ';

/**
 * 밸런스 게임 질문 문구 — "오직 사랑만으로 결혼할 수 있다?!" → "Q. 오직 사랑만으로 결혼할 수 있다?!".
 * 서버 문장이 이미 "Q." 로 시작하면 두 번 붙이지 않는다.
 */
export function formatBalanceGameQuestion(question: string): string {
  const trimmed = question.trim();
  if (/^Q\./i.test(trimmed)) return trimmed;
  return `${QUESTION_PREFIX}${trimmed}`;
}
