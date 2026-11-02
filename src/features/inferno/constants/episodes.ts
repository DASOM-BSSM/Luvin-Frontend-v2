/** [DRAFT] Ten-episode block story integration. */
import type { InfernoEpisode } from '@/src/features/inferno/types';

/**
 * 타이틀 위 알약 문구. 에피소드가 달라도 이 문구는 항상 같아서 에피소드마다 두지 않는다.
 * Figma `ep0-시작` (6159:3326).
 */
export const INFERNO_TAGLINE = '낯선 온도를 만나는 반죽들의 이야기';

/**
 * 러빈지옥 전체 에피소드. API 연동 전까지 여기서 관리한다.
 *
 * 에피소드를 추가하거나 제목을 고칠 일이 생기면 이 배열만 건드리면 된다.
 *
 * 가이드 회차(ep0)는 없앴다(사용자 결정). 러빈지옥은 늘 1화부터 시작한다.
 *
 * 회차 이름은 홈 카드·시작 화면·회차 하단 바·오븐 목록 어디서나 이 목록 하나만 쓴다(사용자 결정 — 화면마다
 * 이름이 다르면 안 된다). 홈 카드에 한 줄로 들어가야 해서 12자 이내. 예전 제목("안녕하세요 소금빵입니다!" 등)은
 * 소금빵·옛 5화 줄거리를 전제로 해서 내 반죽과 상관없는 중립 제목으로 바꿨다. 서버 회차 소개(intro)의 문구는
 * 이름으로 쓰지 않는다.
 */
export const INFERNO_EPISODES: readonly InfernoEpisode[] = [
  { order: 1, title: '첫 만남' },
  { order: 2, title: '단톡방이 생겼다' },
  { order: 3, title: '둘만 남은 날' },
  { order: 4, title: '다 같이 준비' },
  { order: 5, title: '그날의 연락' },
  { order: 6, title: '마음을 전하는 날' },
  { order: 7, title: '멀어진 거리' },
  { order: 8, title: '엇갈린 마음' },
  { order: 9, title: '다시 이야기할 때' },
  { order: 10, title: '시즌의 끝' },
];

/**
 * [DRAFT] 토큰 없이 볼 수 있는 회차(사용자 결정: 1~3화 무료). 회차 목록의 "무료" 표시와 열기
 * 화면을 띄울지 판단하는 데만 쓴다. 토큰 개수는 서버 값(`episodeTokenCost`)이라 여기 두지 않는다.
 */
export const FREE_EPISODE_ORDERS: readonly number[] = [1, 2, 3];
