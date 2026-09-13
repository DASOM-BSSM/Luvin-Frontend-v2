/**
 * 에피소드 회차를 화면 표기용 라벨로 바꾼다.
 *
 * Figma 표기: `Episode 01.` (두 자리 0 패딩 + 마침표)
 *
 *   formatEpisodeLabel(1)  // "Episode 01."
 *   formatEpisodeLabel(12) // "Episode 12."
 */
export function formatEpisodeLabel(order: number): string {
  return `Episode ${String(order).padStart(2, '0')}.`;
}
