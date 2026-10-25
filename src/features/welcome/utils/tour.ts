/** 환영 화면 제목. 닉네임이 비어 있으면 호칭 없이 인사만 한다. */
export function buildWelcomeTitle(nickname: string | undefined): string {
  const trimmed = nickname?.trim();
  return trimmed ? `${trimmed}님, 환영해요` : '환영해요';
}

/**
 * 가로 스크롤 위치로 지금 장 번호를 구한다. 손을 뗀 위치가 장 경계에서 살짝 어긋나도
 * 가장 가까운 장으로 맞추고, 끝을 넘겨 튕긴(bounce) 값은 처음/마지막 장으로 자른다.
 */
export function pageFromOffset(offsetX: number, pageWidth: number, pageCount: number): number {
  if (pageWidth <= 0) {
    return 0;
  }
  const page = Math.round(offsetX / pageWidth);
  return Math.min(Math.max(page, 0), pageCount - 1);
}
