/**
 * 러빈지옥 시즌 규칙과 안내 문구.
 *
 * 첫 시즌은 무료이고, 다음 시즌은 미니게임으로 모은 토큰을 써야 시작할 수 있다(제품 결정).
 */

/** 다음 시즌 하나를 시작하는 데 드는 토큰 수. */
export const NEXT_SEASON_TOKEN_COST = 1;

/** `AiSeasonStatusView.status` 가 끝난 시즌일 때의 값. 실기기 응답으로 확인함. */
export const COMPLETED_SEASON_STATUS = 'COMPLETED';

/** 다음 시즌 안내 모달 문구. 시안이 따로 없어 홈의 NOTICE 모달(6602:3711) 모양에 문구만 바꿔 쓴다. */
export const NEXT_SEASON_NOTICE = {
  message: `다음 시즌을 시작하려면 토큰 ${NEXT_SEASON_TOKEN_COST}개가 필요해요!`,
  actionLabel: '미니게임으로 토큰 모으기',
};
