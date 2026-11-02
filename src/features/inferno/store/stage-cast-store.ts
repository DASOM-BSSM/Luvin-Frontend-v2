/**
 * [DRAFT] 1화 무대 소개의 출연진(stageIntro.cast)을 시즌 단위로 기기에 둔다.
 *
 * 서버는 stageIntro 를 1화 본문에만 준다. 그런데 전체대화의 반죽 소개(관계·특징)는 모든 회차에서
 * 1화와 똑같이 보여야 해서(사용자 결정), 1화를 받을 때 저장해 두고 2화부터 꺼내 쓴다.
 * 며칠 뒤에 다음 회차를 볼 수 있으므로 앱을 껐다 켜도 남게 MMKV 에 둔다(비민감 값, §12).
 *
 * 키는 회차 본문과 같은 `${userId}:${seasonId}` 다 — 계정·시즌이 바뀌면 섞이지 않는다.
 */
import { create } from 'zustand';

import type { StageCastMember } from '@/src/features/inferno/types/story';
import { getStorageJson, setStorageJson } from '@/src/lib/storage';

const STORAGE_PREFIX = 'inferno.stage-cast.';

interface StageCastStore {
  /** 시즌 키 → 출연진. 이번 실행에서 읽거나 저장한 것만 들고 있다. */
  casts: Record<string, StageCastMember[]>;
  save: (seasonKey: string, cast: StageCastMember[]) => void;
}

export const useStageCastStore = create<StageCastStore>((set) => ({
  casts: {},
  save: (seasonKey, cast) => {
    setStorageJson(`${STORAGE_PREFIX}${seasonKey}`, cast);
    set((state) => ({ casts: { ...state.casts, [seasonKey]: cast } }));
  },
}));

/** 메모리에 없으면 MMKV 에서 읽는다. 저장 형식이 깨졌으면 빈 배열. */
export function readStageCast(seasonKey: string, cached: StageCastMember[] | undefined) {
  if (cached) return cached;
  const stored = getStorageJson<StageCastMember[]>(`${STORAGE_PREFIX}${seasonKey}`);
  return Array.isArray(stored) ? stored : [];
}
