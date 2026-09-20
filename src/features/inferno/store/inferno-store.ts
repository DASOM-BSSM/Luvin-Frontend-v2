import { create } from 'zustand';

import { getStorageJson, setStorageJson } from '@/src/lib/storage';

/** 비민감 값이라 MMKV 에 둔다(§12 표). */
const COMPLETED_ORDERS_KEY = 'inferno.completedOrders';

/**
 * 러빈지옥 진행 상태.
 *
 * 원래는 서버가 들고 있어야 할 값이라 메모리에만 뒀었는데, API 가 붙기 전까지 앱을 껐다
 * 켤 때마다 ep0 부터 다시 봐야 해서 확인이 너무 번거로웠다. 비민감 값이므로 MMKV 로
 * 옮긴다(토큰 잔액과 같은 방식). API 가 생기면 이 저장은 서버 상태로 대체될 자리다.
 */
interface InfernoStore {
  /** 끝까지 본 에피소드 회차들. */
  completedOrders: number[];
  /** 해당 회차를 끝까지 봤다고 기록한다. 이미 있으면 그대로 둔다. */
  completeEpisode: (order: number) => void;
  /** 진행도를 통째로 지정한다. 회차를 하나씩 쌓지 않고 특정 상태로 맞출 때 쓴다. */
  setCompletedOrders: (orders: number[]) => void;
  /** 처음부터 다시 시작한다. */
  resetProgress: () => void;
}

/** 상태와 저장소를 항상 같이 바꾼다. 한쪽만 바꾸면 다음 실행에서 어긋난다. */
function persist(orders: number[]): number[] {
  setStorageJson(COMPLETED_ORDERS_KEY, orders);

  return orders;
}

export const useInfernoStore = create<InfernoStore>((set, get) => ({
  completedOrders: getStorageJson<number[]>(COMPLETED_ORDERS_KEY) ?? [],

  completeEpisode: (order) => {
    if (get().completedOrders.includes(order)) {
      return;
    }

    set({ completedOrders: persist([...get().completedOrders, order]) });
  },

  setCompletedOrders: (orders) => set({ completedOrders: persist([...orders]) }),

  resetProgress: () => set({ completedOrders: persist([]) }),
}));
