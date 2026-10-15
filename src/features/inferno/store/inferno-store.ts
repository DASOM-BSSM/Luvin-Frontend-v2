import { create } from 'zustand';

import { getStorageJson, setStorageJson } from '@/src/lib/storage';

/** 비민감 값이라 MMKV 에 둔다(§12 표). */
const COMPLETED_ORDERS_KEY = 'inferno.completedOrders';
const CHECKPOINTS_KEY = 'inferno.checkpoints';

/** "잠시 나가기" 로 나갈 때 보던 자리. 어느 시즌에서 남긴 자리인지도 같이 둔다. */
export interface InfernoCheckpoint {
  step: number;
  /** 남길 때의 시즌 id. 모르면(시즌 정보를 아직 못 받았으면) 비어 있다. */
  seasonId?: string;
}

/** 회차 → "잠시 나가기" 로 나갈 때 보던 자리. 아직 나간 적 없는 회차는 없다. */
type InfernoCheckpoints = Record<number, InfernoCheckpoint | undefined>;

/**
 * 러빈지옥 진행 상태.
 *
 * 원래는 서버가 들고 있어야 할 값이라 메모리에만 뒀었는데, API 가 붙기 전까지 앱을 껐다
 * 켤 때마다 ep0 부터 다시 봐야 해서 확인이 너무 번거로웠다. 비민감 값이므로 MMKV 로
 * 옮긴다(토큰 잔액과 같은 방식). API 가 생기면 이 저장은 서버 상태로 대체될 자리다.
 *
 * 회차 안의 이어보기 지점(checkpoints)도 MMKV 에 둔다. 예전에는 한 번의 실행 안에서만
 * 이어보면 된다고 보고 메모리에만 뒀는데, "잠시 나가기" 는 무조건 보던 자리에서 이어봐야 한다는
 * 결정이 나서(사용자 결정) 앱을 껐다 켜도 남게 했다. 다음 시즌의 같은 회차에서 지난 시즌 자리로
 * 이어지지 않도록 시즌 id 를 같이 남기고, 읽을 때 시즌이 다르면 버린다(readCheckpoint).
 */
interface InfernoStore {
  /** 끝까지 본 에피소드 회차들. */
  completedOrders: number[];
  /**
   * 회차별로 마지막에 보던 단계. 회차 안의 진행을 숫자 하나로 눕힌 값이라 뜻은 회차마다
   * 다르다(ep1 은 대화 쪽 0..n-1 과 투표지 n, ep2 는 전체대화 0 과 1:1 대화 1..n).
   * 그 대응은 각 회차 흐름 훅이 정한다.
   */
  checkpoints: InfernoCheckpoints;
  /** 해당 회차를 끝까지 봤다고 기록한다. 이미 있으면 그대로 둔다. */
  completeEpisode: (order: number) => void;
  /** "잠시 나가기" 로 나갈 때 보던 자리를 기억해 둔다. 다시 들어오면 여기서 이어 본다. */
  saveCheckpoint: (order: number, step: number, seasonId?: string) => void;
  /** 진행도를 통째로 지정한다. 회차를 하나씩 쌓지 않고 특정 상태로 맞출 때 쓴다. */
  setCompletedOrders: (orders: number[]) => void;
  /** 처음부터 다시 시작한다. */
  resetProgress: () => void;
  /**
   * 홈에서 "다음 시즌" 안내 모달을 띄워야 하는지. ep5 의 "다음 시즌 시작하기" 나 끝난 시즌에서
   * 시작하기를 누르면 켜고, 홈이 모달을 닫을 때 끈다. 화면 사이 신호라 저장하지 않는다(메모리).
   * 경로 파라미터로 넘기지 않는 이유: 라우트 경로·파라미터는 딥링크 계약이라 늘리지 않는다(§13).
   */
  isNextSeasonNoticePending: boolean;
  requestNextSeasonNotice: () => void;
  clearNextSeasonNotice: () => void;
}

/** 상태와 저장소를 항상 같이 바꾼다. 한쪽만 바꾸면 다음 실행에서 어긋난다. */
function persist(orders: number[]): number[] {
  setStorageJson(COMPLETED_ORDERS_KEY, orders);

  return orders;
}

/** 이어보기 지점도 상태와 저장소를 같이 바꾼다. */
function persistCheckpoints(checkpoints: InfernoCheckpoints): InfernoCheckpoints {
  setStorageJson(CHECKPOINTS_KEY, checkpoints);

  return checkpoints;
}

/**
 * 이 시즌에서 이어볼 자리. 다른 시즌에서 남긴 자리면 쓰지 않는다(처음부터). 지금 시즌을 아직
 * 모르거나 남길 때 시즌을 몰랐으면 같은 시즌으로 본다 — 끝까지 본 회차는 자리가 지워지므로
 * (completeEpisode) 남아 있는 자리는 대부분 지금 보던 시즌의 것이다.
 */
export function readCheckpoint(
  checkpoints: InfernoCheckpoints,
  order: number,
  seasonId: string | undefined,
): number | undefined {
  const checkpoint = checkpoints[order];
  if (!checkpoint) {
    return undefined;
  }

  const isOtherSeason = seasonId !== undefined && checkpoint.seasonId !== undefined && checkpoint.seasonId !== seasonId;
  return isOtherSeason ? undefined : checkpoint.step;
}

/** 한 회차의 이어보기 지점을 지운다. 다음에 들어가면 처음부터다. */
function withoutCheckpoint(checkpoints: InfernoCheckpoints, order: number): InfernoCheckpoints {
  const next = { ...checkpoints };
  delete next[order];

  return next;
}

export const useInfernoStore = create<InfernoStore>((set, get) => ({
  completedOrders: getStorageJson<number[]>(COMPLETED_ORDERS_KEY) ?? [],

  checkpoints: getStorageJson<InfernoCheckpoints>(CHECKPOINTS_KEY) ?? {},

  completeEpisode: (order) => {
    // 끝까지 본 회차는 이어볼 자리가 없다. 다시 들어가면 처음부터 본다.
    set({ checkpoints: persistCheckpoints(withoutCheckpoint(get().checkpoints, order)) });

    if (get().completedOrders.includes(order)) {
      return;
    }

    set({ completedOrders: persist([...get().completedOrders, order]) });
  },

  saveCheckpoint: (order, step, seasonId) =>
    set({ checkpoints: persistCheckpoints({ ...get().checkpoints, [order]: { step, seasonId } }) }),

  setCompletedOrders: (orders) =>
    set({ completedOrders: persist([...orders]), checkpoints: persistCheckpoints({}) }),

  resetProgress: () => set({ completedOrders: persist([]), checkpoints: persistCheckpoints({}) }),

  isNextSeasonNoticePending: false,

  requestNextSeasonNotice: () => set({ isNextSeasonNoticePending: true }),

  clearNextSeasonNotice: () => set({ isNextSeasonNoticePending: false }),
}));
