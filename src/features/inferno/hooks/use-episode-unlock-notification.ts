/**
 * [DRAFT] 다음 회차 공개 알림. 루트 레이아웃에 늘 붙어 있다.
 *
 * - 서버 진행 상태에 `nextUnlockAt` 이 생기면 그 시각에 로컬 알림을 건다(앱이 꺼져 있어도 울린다).
 *   시각이 바뀌거나 이미 열었으면 다시 걸거나 취소한다. 로그아웃하면 취소한다.
 * - 알림을 눌러 들어오면 그 회차 시작 화면으로 보낸다.
 */
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { infernoIntroHref } from '@/src/features/inferno/constants/routes';
import useStoryState from '@/src/features/inferno/hooks/use-story-state';
import {
  cancelUnlockNotification,
  scheduleUnlockNotification,
} from '@/src/features/inferno/lib/unlock-notification';
import {
  planUnlockNotification,
  readUnlockNotificationOrder,
} from '@/src/features/inferno/utils/unlock-notification';

export default function useEpisodeUnlockNotification() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const story = useStoryState();
  const response = Notifications.useLastNotificationResponse();

  const nextUnlockAt = story.data?.nextUnlockAt ?? null;
  const lastCompletedOrder = Math.max(0, ...(story.data?.completedOrders ?? []));
  const hasStory = story.data !== undefined;

  useEffect(() => {
    // 로그인했는데 아직 상태를 못 받았으면 걸어 둔 예약을 건드리지 않는다(앱 시작 직후 지웠다 다시 걸지 않게).
    if (isAuthenticated && !hasStory) return;
    const plan = isAuthenticated
      ? planUnlockNotification(
          { nextUnlockAt, completedOrders: [lastCompletedOrder] },
          Date.now(),
        )
      : null;
    void (plan ? scheduleUnlockNotification(plan) : cancelUnlockNotification());
  }, [isAuthenticated, hasStory, nextUnlockAt, lastCompletedOrder]);

  const tappedOrder = response
    ? readUnlockNotificationOrder(response.notification.request.content.data)
    : null;

  useEffect(() => {
    if (tappedOrder === null || !isAuthenticated) return;
    // 다시 그려질 때 같은 알림으로 또 들어가지 않게 바로 지운다.
    Notifications.clearLastNotificationResponse();
    router.push(infernoIntroHref(tappedOrder));
  }, [tappedOrder, isAuthenticated]);
}
