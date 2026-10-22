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
 */
export const INFERNO_EPISODES: readonly InfernoEpisode[] = [
  { order: 0, title: '러빈지옥에 대해 알려드릴게요' },
  { order: 1, title: '안녕하세요 소금빵입니다!' },
  { order: 2, title: '우리의 단톡방' },
  { order: 3, title: '처음 둘만 남은 날' },
  { order: 4, title: '함께 준비하는 축제' },
  { order: 5, title: '서로 다른 마음의 속도' },
  { order: 6, title: '마음을 전하는 날' },
  { order: 7, title: '조금 멀어진 우리' },
  { order: 8, title: '엇갈린 약속' },
  { order: 9, title: '다시 이야기할 시간' },
  { order: 10, title: '같은 오븐에 남은 마음' },
];

/** [DRAFT] Existing five-episode server seasons keep their original numbering and titles. */
export const LEGACY_INFERNO_EPISODES: readonly InfernoEpisode[] = [
  { order: 1, title: '안녕하세요 소금빵입니다!' },
  { order: 2, title: '우리 조금 잘 맞는 것 같아요' },
  { order: 3, title: '미니게임으로 사랑을 쟁취하세요!' },
  { order: 4, title: '계속 알아가고 싶어요' },
  { order: 5, title: '최종 결과를 공유해요' },
];
