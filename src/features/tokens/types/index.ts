/** openapi `TokenBalanceResponse` — `GET /api/tokens/me`. */
export interface TokenBalance {
  /** 소금빵(무료 토큰). 미니게임으로 얻는다. */
  tokenBalance: number;
  /** [DRAFT] 식빵(유료 토큰). 결제로 얻는다. 서버가 아직 안 주면 없다. */
  breadTokenBalance?: number;
  /** 무료로 남은 시뮬레이션(에피소드 진행) 횟수. 아직 이 값을 쓰는 화면이 없다. */
  freeSimulationCount: number;
}
