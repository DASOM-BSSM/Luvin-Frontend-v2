/** [DRAFT] Ten-episode block story integration. */
/** `inferno`(AI 시즌) 쿼리 키 팩토리(§11). */
export const aiSeasonKeys = {
  /** 시즌 하나에 딸린 쿼리 전부. 시즌이 바뀌면 이 접두사로 한꺼번에 비운다. */
  all: ['ai-season'] as const,
  status: ['ai-season', 'status'] as const,
  report: ['ai-season', 'report'] as const,
};

/** [DRAFT] 회차 쪽지. 회차를 완료할 때마다 서버가 한 통씩 만든다. */
export const partnerLetterKeys = {
  unread: ['ai-season', 'letters', 'unread'] as const,
};

/** [DRAFT] 새 10화 회차 본문. 시즌은 사용자마다 하나라 회차 번호만으로 구분한다. */
export const storyKeys = {
  all: ['ai-season', 'story'] as const,
  content: (order: number) => ['ai-season', 'story', 'content', order] as const,
  /** [DRAFT] 회차 열기 화면의 보유 토큰. 목 모드면 목 서버 값이라 tokens 기능 키와 따로 둔다. */
  tokenBalance: ['ai-season', 'story', 'token-balance'] as const,
};
