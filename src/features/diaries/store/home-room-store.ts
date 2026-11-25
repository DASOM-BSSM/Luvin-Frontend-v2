import { create } from 'zustand';

import type { RoomId } from '@/src/features/diaries/types';
import { getStorageNumber, setStorageNumber } from '@/src/lib/storage';

/** 비민감 값이라 MMKV 에 둔다. 앱을 다시 켜도 홈은 고른 그룹을 보여준다. */
const HOME_ROOM_KEY = 'diaries.home-room-id';

interface HomeRoomStore {
  /** 홈 "쫀쫀한 조합들"에서 고른 그룹. 고른 적 없으면 undefined(utils/feed.ts `pickShortcutRoomId`). */
  selectedRoomId?: RoomId;
  selectRoom: (roomId: RoomId) => void;
}

export const useHomeRoomStore = create<HomeRoomStore>((set) => ({
  selectedRoomId: getStorageNumber(HOME_ROOM_KEY),

  selectRoom: (roomId) => {
    setStorageNumber(HOME_ROOM_KEY, roomId);
    set({ selectedRoomId: roomId });
  },
}));
