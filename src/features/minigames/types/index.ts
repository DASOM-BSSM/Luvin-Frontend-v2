/** openapi `MinigameListItemResponse`. */
export interface MinigameListItem {
  gameId: number;
  /** title 과 달리 바뀌지 않는 식별 키(예: `dinosaur_bread_game`). 백엔드 V4 마이그레이션에서 추가. */
  code: string;
  title: string;
  rewardToken: number;
}

/** openapi `MinigameDetailResponse`. */
export interface MinigameDetail extends MinigameListItem {
  description: string;
  thumbnailUrl: string;
}

/** openapi `MinigamePlayResponse`. */
export interface MinigamePlayResult {
  gameId: number;
  reward: { token: number };
}

/** openapi `MinigamePlayRequest.success` — `"성공"` | `"실패"` 문자열이지 boolean 이 아니다. */
export type MinigameOutcome = 'success' | 'fail';
