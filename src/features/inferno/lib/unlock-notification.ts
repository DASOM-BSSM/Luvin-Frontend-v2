/**
 * [DRAFT] 다음 회차 공개 로컬 알림 예약·취소(expo-notifications). 무엇을 언제 보낼지는
 * utils/unlock-notification 의 순수 함수가 정하고, 여기서는 기기에 걸기만 한다.
 *
 * 알림은 하나만 둔다 — 같은 식별자로 다시 걸면 앞 예약을 대신한다.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  UNLOCK_NOTIFICATION_KIND,
  unlockNotificationBody,
  unlockNotificationTitle,
  type UnlockNotificationPlan,
} from '@/src/features/inferno/utils/unlock-notification';

const NOTIFICATION_ID = 'inferno-episode-unlock';
const ANDROID_CHANNEL_ID = 'episode-unlock';

// 앱을 보고 있을 때 울려도 배너로 보여준다(안 그러면 앱이 켜져 있는 동안엔 조용히 사라진다).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** 권한이 없으면 한 번 묻는다. 거절했으면 다시 묻지 않고 false. */
async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleUnlockNotification(plan: UnlockNotificationPlan): Promise<void> {
  // 권한 창이 떠 있는 사이 시각이 지났을 수 있다. 지난 시각으로 걸면 바로 울리니 건너뛴다.
  if (!(await ensurePermission()) || plan.at <= Date.now()) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: '에피소드 공개',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_ID,
    content: {
      title: unlockNotificationTitle(plan.order),
      body: unlockNotificationBody(plan.episodeTitle),
      data: { kind: UNLOCK_NOTIFICATION_KIND, order: plan.order },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: plan.at,
      channelId: ANDROID_CHANNEL_ID,
    },
  });
}

export async function cancelUnlockNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
}
