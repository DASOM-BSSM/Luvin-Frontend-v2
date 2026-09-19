import { create } from 'zustand';

/**
 * 러빈지옥 진행 상태.
 *
 * 메모리에만 둔다. 앱을 껐다 켜면 처음부터가 된다. 실제로는 서버가 들고 있어야 할 값이라
 * (에피소드는 정해진 주기마다 열리고 시청 기록이 계정에 붙는다) MMKV 로 옮기기보다
 * API 연동 때 서버 상태로 대체될 자리다.
 */
interface InfernoStore {
  /** 끝까지 본 에피소드 회차들. */
  completedOrders: number[];
  /** 해당 회차를 끝까지 봤다고 기록한다. 이미 있으면 그대로 둔다. */
  completeEpisode: (order: number) => void;
  /** 처음부터 다시 시작한다. */
  resetProgress: () => void;
}

export const useInfernoStore = create<InfernoStore>((set) => ({
  completedOrders: [],

  completeEpisode: (order) =>
    set((state) =>
      state.completedOrders.includes(order)
        ? state
        : { completedOrders: [...state.completedOrders, order] },
    ),

  resetProgress: () => set({ completedOrders: [] }),
}));
