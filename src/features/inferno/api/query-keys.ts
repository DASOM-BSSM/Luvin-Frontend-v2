/** `inferno`(AI 시즌) 쿼리 키 팩토리(§11). */
export const aiSeasonKeys = {
  status: ['ai-season', 'status'] as const,
  episode: (episodeNumber: number) => ['ai-season', 'episode', episodeNumber] as const,
  report: ['ai-season', 'report'] as const,
};
