import { create } from 'zustand';

import type { BreadProfile } from '@/src/features/home/types';
import { getStorageJson, setStorageJson } from '@/src/lib/storage';

/** 비민감 값이라 MMKV 에 둔다(§12 표). */
const BREAD_PROFILE_KEY = 'bread.profile';

/**
 * 설문을 마쳤을 때 나오는 반죽 예시. API 연동 전까지 쓰는 값이다.
 * Figma `내 성향-우린` (5747:4183) 의 값 그대로다.
 */
export const SAMPLE_BREAD_PROFILE: BreadProfile = {
  type: 'salt',
  state: 'dough',
  name: '쫀쫀한 소금빵 반죽',
  description: '저는 오직 제 사람에게만 따뜻해요',
};

/**
 * 내 분신(반죽).
 *
 * 홈과 내 성향 화면이 각자 상수로 들고 있던 값을 한곳으로 모은 것이다. 둘이 서로 다른 값을
 * 박아 두고 있어서 "반죽 없음" 상태를 확인하려면 두 파일을 같이 고쳐야 했다.
 *
 * 기본값은 반죽 없음(설문 전)이다. 설문 결과 연결은 이 스토어에 쓰기만 하면 되는 자리다.
 */
interface BreadStore {
  /** 아직 설문을 안 했으면 null. */
  profile: BreadProfile | null;
  setProfile: (profile: BreadProfile | null) => void;
}

export const useBreadStore = create<BreadStore>((set) => ({
  profile: getStorageJson<BreadProfile>(BREAD_PROFILE_KEY) ?? null,

  setProfile: (profile) => {
    setStorageJson(BREAD_PROFILE_KEY, profile);
    set({ profile });
  },
}));
