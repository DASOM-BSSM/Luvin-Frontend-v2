/**
 * 댓글 길이 · 개수 제한. 시안에 정해진 값이 없어 정했다(사용자 결정) — 서버는 아직 길이 제한이 없다.
 */

/** 댓글 한 개의 최대 글자 수. 입력칸에서 이 이상은 입력되지 않는다. */
export const COMMENT_MAX_LENGTH = 100;

/** 이 줄 수를 넘는 댓글은 접어 두고 "더보기"로 펼친다. */
export const COMMENT_MAX_LINES = 3;

/** 일기 상세에서 처음에 보여주는 댓글 수 — 가장 최근 것부터. */
export const VISIBLE_COMMENT_COUNT = 3;

/**
 * 처음에 보여줄 댓글과 숨긴 개수. 목록은 작성순(오래된 것 먼저)이라 끝에서 `limit` 개를 보여주고,
 * 앞쪽(이전 댓글)을 숨긴다. 펼쳤으면 전부 보여준다.
 */
export function selectVisibleComments<T>(
  comments: readonly T[],
  isExpanded: boolean,
  limit: number = VISIBLE_COMMENT_COUNT,
): { visible: readonly T[]; hiddenCount: number } {
  if (isExpanded || comments.length <= limit) return { visible: comments, hiddenCount: 0 };
  return { visible: comments.slice(-limit), hiddenCount: comments.length - limit };
}
