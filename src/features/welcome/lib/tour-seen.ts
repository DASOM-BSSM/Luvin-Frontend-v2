import { getStorageBoolean, setStorageBoolean } from '@/src/lib/storage';

const TOUR_SEEN_KEY = 'welcome.tourSeen';

/**
 * 앱 소개 투어를 이 기기에서 이미 봤는지. 투어는 로그인 전, 앱을 처음 켰을 때 한 번만 보여준다
 * (사용자 결정) — 계정이 아니라 기기 기준이라 MMKV 에 둔다(비민감 값, §12).
 */
export function hasSeenTour(): boolean {
  return getStorageBoolean(TOUR_SEEN_KEY) ?? false;
}

/**
 * 투어를 본 것으로 기록한다. 투어를 끝까지 넘겼을 때, 그리고 로그인에 성공했을 때 부른다 —
 * 투어가 생기기 전부터 로그인해 쓰던 사람이 로그아웃했다고 투어가 뜨지 않게 하기 위함이다.
 */
export function markTourSeen(): void {
  setStorageBoolean(TOUR_SEEN_KEY, true);
}
