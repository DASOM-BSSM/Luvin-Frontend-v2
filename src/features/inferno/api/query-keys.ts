/** `inferno`(AI 시즌) 쿼리 키 팩토리(§11). */
export const aiSeasonKeys = {
  /** 시즌 하나에 딸린 쿼리 전부. 시즌이 바뀌면 이 접두사로 한꺼번에 비운다. */
  all: ['ai-season'] as const,
  status: ['ai-season', 'status'] as const,
  episode: (episodeNumber: number) => ['ai-season', 'episode', episodeNumber] as const,
  report: ['ai-season', 'report'] as const,
};

/** 메시지 좋아요(하트). `match-controller`/`episode-controller` 소속이라 따로 둔다. */
export const likeKeys = {
  likedMessages: ['likes', 'messages'] as const,
};
