/** `inferno`(AI 시즌) 쿼리 키 팩토리(§11). */
export const aiSeasonKeys = {
  status: ['ai-season', 'status'] as const,
  episode: (episodeNumber: number) => ['ai-season', 'episode', episodeNumber] as const,
  report: ['ai-season', 'report'] as const,
};

/** 메시지 좋아요(하트). `match-controller`/`episode-controller` 소속이라 따로 둔다. */
export const likeKeys = {
  likedMessages: ['likes', 'messages'] as const,
};

/** EP5 이후 최종 매칭 상대가 보내는 쪽지. 쪽지 한 통마다 따로 받는다. */
export const partnerLetterKeys = {
  letter: (letterId: string) => ['partner-letter', letterId] as const,
};
