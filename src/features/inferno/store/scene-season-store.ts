/**
 * [DRAFT] 회차를 어디까지 봤는지(이어보기 자리)만 기기에 둔다. 선택·완료·경로는 서버
 * `story` 가 가진다 — 여기서 다시 계산하지 않는다. 앱을 다시 켜면 처음부터 다시 본다.
 */
import { create } from 'zustand';

interface SceneSession {
  /** 회차 번호 → 재생 위치. -1 은 10화 대화를 다 보고 리포트로 넘어간 상태. */
  positions: Record<number, number>;
  reportPage: number;
}

interface Store {
  sessions: Record<string, SceneSession>;
  save: (key: string, order: number, position: number) => void;
  saveReport: (key: string, page: number) => void;
  reset: () => void;
}

const emptySession = (): SceneSession => ({ positions: {}, reportPage: 0 });

export const useSceneSeasonStore = create<Store>((set) => ({
  sessions: {},
  save: (key, order, position) =>
    set((state) => {
      const current = state.sessions[key] ?? emptySession();
      return {
        sessions: {
          ...state.sessions,
          [key]: { ...current, positions: { ...current.positions, [order]: position } },
        },
      };
    }),
  saveReport: (key, reportPage) =>
    set((state) => {
      const current = state.sessions[key] ?? emptySession();
      return { sessions: { ...state.sessions, [key]: { ...current, reportPage } } };
    }),
  reset: () => set({ sessions: {} }),
}));
