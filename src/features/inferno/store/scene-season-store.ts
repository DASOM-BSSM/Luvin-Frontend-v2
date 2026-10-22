/** [DRAFT] Session-only narrative state, isolated by user and season. */
import { create } from 'zustand';
import type { ChoiceRecord, SceneSeasonState } from '@/src/features/inferno/types/scene-block';
import { applyChoice } from '@/src/features/inferno/utils/resolve-choice';
export const emptySceneSeason = (): SceneSeasonState => ({
  route: null,
  choices: [],
  rejectCount: {},
});
interface SceneSession {
  season: SceneSeasonState;
  positions: Record<number, number>;
  reportPage: number;
  completedOrders: number[];
}
interface Store {
  sessions: Record<string, SceneSession>;
  record: (key: string, choice: ChoiceRecord) => void;
  save: (key: string, order: number, position: number) => void;
  saveReport: (key: string, page: number) => void;
  complete: (key: string, order: number) => void;
  reset: () => void;
}
export const useSceneSeasonStore = create<Store>((set) => ({
  sessions: {},
  record: (key, choice) =>
    set((state) => {
      const current = state.sessions[key] ?? {
        season: emptySceneSeason(),
        positions: {},
        reportPage: 0,
        completedOrders: [],
      };
      return {
        sessions: {
          ...state.sessions,
          [key]: { ...current, season: applyChoice(current.season, choice) },
        },
      };
    }),
  save: (key, order, position) =>
    set((state) => {
      const current = state.sessions[key] ?? {
        season: emptySceneSeason(),
        positions: {},
        reportPage: 0,
        completedOrders: [],
      };
      return {
        sessions: {
          ...state.sessions,
          [key]: { ...current, positions: { ...current.positions, [order]: position } },
        },
      };
    }),
  saveReport: (key, reportPage) =>
    set((state) => {
      const current = state.sessions[key] ?? {
        season: emptySceneSeason(),
        positions: {},
        reportPage: 0,
        completedOrders: [],
      };
      return { sessions: { ...state.sessions, [key]: { ...current, reportPage } } };
    }),
  complete: (key, order) =>
    set((state) => {
      const current = state.sessions[key] ?? {
        season: emptySceneSeason(),
        positions: {},
        reportPage: 0,
        completedOrders: [],
      };
      return {
        sessions: {
          ...state.sessions,
          [key]: { ...current, completedOrders: [...new Set([...current.completedOrders, order])] },
        },
      };
    }),
  reset: () => set({ sessions: {} }),
}));
