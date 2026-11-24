import useEpisodeUnlockNotification from
  '@/src/features/inferno/hooks/use-episode-unlock-notification';

/** [DRAFT] 다음 회차 공개 알림을 걸고, 알림을 누르면 회차로 보낸다. 그리는 것은 없다. */
export default function EpisodeUnlockNotifier() {
  useEpisodeUnlockNotification();
  return null;
}
