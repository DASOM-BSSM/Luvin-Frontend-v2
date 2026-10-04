import queryClient from '@/src/lib/query-client';

import { diaryKeys, roomKeys } from '@/src/features/diaries/api/query-keys';

/**
 * 일기가 바뀌면(작성 · 수정 · 삭제 · 반응) 그 일기가 보일 수 있는 목록을 전부
 * 다시 불러온다 — 내 일기 목록, 커뮤니티 피드, 모든 공유방 피드. 어느 방 피드에 들어 있는지
 * 응답만으로는 알 수 없어서 공유방 피드는 통째로 무효화한다.
 */
export function invalidateDiaryFeeds() {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: diaryKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: diaryKeys.community() }),
    queryClient.invalidateQueries({
      queryKey: roomKeys.all,
      predicate: (query) => query.queryKey.includes('diaries'),
    }),
  ]);
}
