/** `inferno`(AI 시즌) 쿼리 키 팩토리(§11). */
export const aiSeasonKeys = {
  /** 시즌 하나에 딸린 쿼리 전부. 시즌이 바뀌면 이 접두사로 한꺼번에 비운다. */
  all: ['ai-season'] as const,
  status: ['ai-season', 'status'] as const,
  /** 지난 시즌까지 포함한 시즌 목록. `all` 접두사 아래라 새 시즌을 열면 같이 비워진다. */
  list: ['ai-season', 'list'] as const,
  /**
   * 회차 대화. `seasonId` 는 지난 시즌을 다시 볼 때만 넘긴다(use-viewed-season) — 넘기지 않으면 최신
   * 시즌의 키라서, 지난 시즌 대화가 지금 시즌 캐시와 섞이지 않는다.
   */
  episode: (episodeNumber: number, seasonId?: string) =>
    seasonId ? (['ai-season', 'episode', episodeNumber, seasonId] as const) : (['ai-season', 'episode', episodeNumber] as const),
  /** 회차의 "다시 굽기" 작업 상태. `seasonId` 는 episode 와 같다. */
  reroll: (episodeNumber: number, seasonId?: string) =>
    seasonId ? (['ai-season', 'reroll', episodeNumber, seasonId] as const) : (['ai-season', 'reroll', episodeNumber] as const),
  /** 다시 굽기를 요청한 뒤 새 대화가 다 만들어졌는지 확인하는 폴링. */
  rerollProgress: (episodeNumber: number, baseVersionId: string, attempt: number) =>
    ['ai-season', 'reroll-progress', episodeNumber, baseVersionId, attempt] as const,
  report: ['ai-season', 'report'] as const,
  /** 지난 시즌의 리포트(use-viewed-season). 최신 시즌은 `report` 를 쓴다. */
  pastReport: (seasonId: string) => ['ai-season', 'report', seasonId] as const,
};

/** 메시지 좋아요(하트). `match-controller`/`episode-controller` 소속이라 따로 둔다. */
export const likeKeys = {
  likedMessages: ['likes', 'messages'] as const,
};

/** EP5 이후 최종 매칭 상대가 보내는 쪽지. 쪽지 한 통마다 따로 받는다. */
export const partnerLetterKeys = {
  letter: (letterId: string) => ['partner-letter', letterId] as const,
};
