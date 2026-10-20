import { useMutation } from '@tanstack/react-query';

import { reactToDiary, type ReactToDiaryInput } from '@/src/features/diaries/api/diaries';
import { diaryKeys, roomKeys } from '@/src/features/diaries/api/query-keys';
import type { DiaryFeedItem, DiaryReactionResult } from '@/src/features/diaries/types';
import { applyReactionResult } from '@/src/features/diaries/utils/feed';
import queryClient from '@/src/lib/query-client';

function isRoomDiariesQuery(query: { queryKey: readonly unknown[] }) {
  return query.queryKey.includes('diaries');
}

/** 피드 캐시(커뮤니티 · 모든 공유방 피드)를 고르는 필터들. */
const FEED_FILTERS = [
  { queryKey: diaryKeys.community() },
  { queryKey: roomKeys.all, predicate: isRoomDiariesQuery },
];

/**
 * 이모지 반응. 서버가 결과(`emoji`/`liked`/`likeCount`)를 돌려주므로, 다시 불러오지 않고
 * 그 값으로 피드 캐시의 해당 일기만 고친다.
 *
 * 같은 이모지를 다시 보내면 취소되는 토글이라 연타하면 상태가 뒤집힌다 — 누르는 버튼에서
 * `isPending` 동안 막을 것.
 */
export default function useReactToDiary() {
  return useMutation({
    mutationFn: (input: ReactToDiaryInput) => reactToDiary(input),
    onSuccess: (result: DiaryReactionResult) => {
      for (const filters of FEED_FILTERS) {
        queryClient.setQueriesData<DiaryFeedItem[]>(filters, (feed) =>
          feed ? applyReactionResult(feed, result) : feed,
        );
      }
    },
  });
}
