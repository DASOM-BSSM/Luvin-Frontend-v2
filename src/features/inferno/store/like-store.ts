import { create } from 'zustand';

import { getStorageJson, setStorageJson } from '@/src/lib/storage';

/** 비민감 값이라 MMKV 에 둔다(§12 표). */
const LIKES_KEY = 'inferno.likes';

/** 시즌 id → 회차 → 하트를 누른 1:1 대화 줄(message id) 목록. */
type InfernoLikes = Record<string, Record<number, string[] | undefined> | undefined>;

/**
 * 러빈지옥 1:1 대화(ep2·ep4)에서 하트를 누른 줄 기록.
 *
 * 서버의 좋아요 API(`POST /api/matches/{matchId}/conversations/{messageId}/like`, api/likes.ts)는
 * `match-controller` 소속이라 숫자 matchId/messageId 를 받는데, AI 시즌 1:1 대화의 줄 id 는
 * 문자열(UUID)이라 그대로 넘길 수 없다. AI 시즌용 좋아요 API 가 정해지기 전까지 기기에 남긴다
 * (selection-store 와 같은 방식). API 가 생기면 이 저장은 서버 값으로 대체될 자리다.
 *
 * 시즌 id 로 나눠 두어서 계정이 바뀌거나 다음 시즌이 시작돼도 서로 섞이지 않는다.
 */
interface InfernoLikeStore {
  likes: InfernoLikes;
  toggleLike: (seasonId: string, order: number, messageId: string) => void;
}

export const useInfernoLikeStore = create<InfernoLikeStore>((set, get) => ({
  likes: getStorageJson<InfernoLikes>(LIKES_KEY) ?? {},

  toggleLike: (seasonId, order, messageId) => {
    const current = get().likes;
    const liked = current[seasonId]?.[order] ?? [];
    const nextLiked = liked.includes(messageId)
      ? liked.filter((id) => id !== messageId)
      : [...liked, messageId];
    const next: InfernoLikes = {
      ...current,
      [seasonId]: { ...current[seasonId], [order]: nextLiked },
    };
    setStorageJson(LIKES_KEY, next);
    set({ likes: next });
  },
}));
