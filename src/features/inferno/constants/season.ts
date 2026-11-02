import type { SeasonSetting } from '@/src/features/inferno/types/story';

/** 러빈지옥 시즌 규칙. 시즌은 사용자마다 하나이고 10화가 끝나면 끝이다(사용자 결정). */
/** [DRAFT] 바뀐 규칙: 10화가 끝나면 "새로운 시즌 만들기"로 다음 시즌을 연다(사용자 결정, use-start-next-season.ts). */

/** `AiSeasonStatusView.status` 가 끝난 시즌일 때의 값. 실기기 응답으로 확인함. */
export const COMPLETED_SEASON_STATUS = 'COMPLETED';

/**
 * 배경별 시즌 제목. 1화 무대 소개 제목과 같다(Figma `ep1-시작` "In School"). 10화까지 끝낸 시즌은
 * 홈·오븐의 시즌 카드에 "SEASON 01" 대신 이 제목을 쓴다(사용자 결정).
 */
export const SEASON_STAGE_TITLES: Record<SeasonSetting, string> = {
  school: 'In School',
  campus: 'In Campus',
  office: 'In Office',
  cafe: 'In Cafe',
};
