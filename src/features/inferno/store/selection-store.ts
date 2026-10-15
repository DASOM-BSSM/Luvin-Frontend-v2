import { create } from 'zustand';

import { getStorageJson, setStorageJson } from '@/src/lib/storage';

/** 비민감 값이라 MMKV 에 둔다(§12 표). */
const SELECTIONS_KEY = 'inferno.selections';

/** 시즌 id → 회차 → 그 회차 투표지에서 고른 반죽(participant id). */
type InfernoSelections = Record<string, Record<number, string | undefined> | undefined>;

/**
 * 러빈지옥 투표에서 내가 고른 반죽 기록. 지난 회차를 다시 볼 때 투표지에 "이미 고른 반죽"을
 * 보여주는 데 쓴다(사용자 요청: 다시 볼 때는 투표 모달 없이 내가 고른 반죽이 선택된 채 나와야 함).
 *
 * 원래는 서버가 줘야 할 값이다 — 투표 결과는 서버에 저장되지만(`POST .../episodes/{1,3}/selection`)
 * 그걸 다시 읽는 API 가 아직 없어서 백엔드에 요청해 둔 상태이고, 그동안 기기에 남긴다(사용자 결정).
 * 그래서 앱을 지우거나 다른 기기에서 보면 기록이 없고, 이 기록을 남기기 전에 끝낸 투표도 없다.
 * 선택 조회 API 가 생기면 이 저장은 서버 값으로 대체될 자리다.
 *
 * 시즌 id 로 나눠 두어서 계정이 바뀌거나 다음 시즌이 시작돼도 서로 섞이지 않는다.
 */
interface InfernoSelectionStore {
  selections: InfernoSelections;
  recordSelection: (seasonId: string, order: number, participantId: string) => void;
}

export const useInfernoSelectionStore = create<InfernoSelectionStore>((set, get) => ({
  selections: getStorageJson<InfernoSelections>(SELECTIONS_KEY) ?? {},

  recordSelection: (seasonId, order, participantId) => {
    const current = get().selections;
    const next: InfernoSelections = {
      ...current,
      [seasonId]: { ...current[seasonId], [order]: participantId },
    };
    setStorageJson(SELECTIONS_KEY, next);
    set({ selections: next });
  },
}));
