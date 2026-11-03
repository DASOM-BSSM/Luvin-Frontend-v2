/** [DRAFT] Existing cast retained; only friend and host are added. */
import type { InfernoParticipant } from '@/src/features/inferno/types';
export const SCENE_CAST: InfernoParticipant[] = [
  { id: 'me', type: 'salt', name: '고소한 소금빵 반죽', isMine: true },
  { id: 'castella', type: 'castella', name: '유쾌한 카스테라 반죽', isMine: false },
  { id: 'donut', type: 'donut', name: '차가운 도넛 반죽', isMine: false },
  { id: 'pretzel', type: 'pretzel', name: '엉뚱한 프레첼 반죽', isMine: false },
  { id: 'friend', type: 'cream', name: '다정한 크림빵 친구', isMine: false },
  { id: 'host', type: 'baguette', name: '명랑한 바게트 반죽', isMine: false },
];
export const CANDIDATE_IDS = ['castella', 'donut', 'pretzel'];
export const PERSONAS: Record<string, 'secure' | 'avoidant' | 'anxious'> = {
  castella: 'secure',
  donut: 'avoidant',
  pretzel: 'anxious',
};
