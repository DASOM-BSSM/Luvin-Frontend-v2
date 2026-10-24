/**
 * 1, "안녕하세요 소금빵입니다!" -> "Episode 01 :: 안녕하세요 소금빵입니다!"
 *
 * 홈의 formatEpisodeLabel 은 "Episode 01." 로 끝나는 다른 형식이라 따로 둔다.
 */
export function formatIntroLabel(order: number, title: string): string {
  return `${formatEpisodeNumber(order)} :: ${title}`;
}

/** 2 -> "Episode 02". ep5 하이라이트의 회차 표시(Figma 5760:4351)도 같은 모양이다. */
export function formatEpisodeNumber(order: number): string {
  return `Episode ${String(order).padStart(2, '0')}`;
}
