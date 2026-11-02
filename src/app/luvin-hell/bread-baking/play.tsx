import { Stack, router, usePathname } from 'expo-router';
import { BackHandler, Pressable, ScrollView, View } from 'react-native';
import { useEffect } from 'react';

import AngleUpIcon from '@/src/assets/icons/AngleUpIcon';
import Button from '@/src/components/ui/button';
import ConfirmModal from '@/src/components/ui/confirm-modal';
import NoticeModal from '@/src/components/ui/notice-modal';
import Screen from '@/src/components/ui/screen';
import Text from '@/src/components/ui/text';
import { miniGameCounterStyle } from '@/src/constants/typography';
import BakingMixingScene from '@/src/features/bread-baking/components/baking-mixing-scene';
import BakingOvenScene from '@/src/features/bread-baking/components/baking-oven-scene';
import BakingShapingScene from '@/src/features/bread-baking/components/baking-shaping-scene';
import {
  BAKING_NOTICE_MESSAGES, BAKING_OVEN_FAIL_MESSAGES, getBakedNoticeMessage,
} from '@/src/features/bread-baking/constants/notices';
import useBakingGame from '@/src/features/bread-baking/hooks/use-baking-game';
import useReportMinigameResult from '@/src/features/minigames/hooks/use-report-minigame-result';
import {
  BAKING_MINIGAME_CODE, BAKING_RULES, formatBakingTime, isBakedNoticeShown, isOvenFailShown,
} from '@/src/features/bread-baking/utils/game';
import GameFrame from '@/src/features/luvin-hell/components/GameFrame';
import ReadyOverlay from '@/src/features/luvin-hell/components/ReadyOverlay';
import ResultOverlay from '@/src/features/luvin-hell/components/ResultOverlay';

/**
 * iOS's edge swipe-back fired during left-to-right shaping swipes (user report, 2026-11-01).
 * Leaving goes through "게임 나가기" and its confirm instead, like the Android back handler.
 */
const SCREEN_OPTIONS = { gestureEnabled: false } as const;

/** Figma 5726:2608 → 7966:6180 → 7966:6239. Assets: 7975:2356. */
export default function BreadBakingPlayScreen() {
  const pathname = usePathname();
  const game = useBakingGame(pathname === '/luvin-hell/bread-baking/play');
  const { state } = game;
  // 미션 성공/실패를 서버에 한 번 보고하고, 성공 보상 토큰은 응답대로 잔액 캐시에 반영된다.
  useReportMinigameResult(BAKING_MINIGAME_CODE, state.phase, 'code');
  const isShaping = ['roll', 'filling', 'shape', 'sprinkle'].includes(state.step);
  const isOven = ['load', 'bake', 'serve'].includes(state.step);
  const ovenFailMessage = isOvenFailShown(state) && state.ovenResult && state.ovenResult !== 'baked'
    ? BAKING_OVEN_FAIL_MESSAGES[state.ovenResult] : '';

  function handleExit() {
    if (router.canGoBack()) router.back();
    else router.replace('/luvin-hell');
  }

  // Leaving the route pauses the clock (the hook watches the pathname), like the old help modal.
  function handleHelpOpen() {
    router.push('/luvin-hell/bread-baking/about');
  }

  function handleBackPress() {
    if (state.phase === 'playing') {
      game.handleExitOpen();
      return true;
    }
    return false;
  }

  useEffect(() => {
    if (pathname !== '/luvin-hell/bread-baking/play') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, [pathname, state.phase]);

  return (
    <Screen>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ScrollView scrollEnabled={!game.isRunning}>
        <View className="items-center">
          <View className="h-baking-top" />
          <View className="w-baking-content gap-baking-frame-gap">
            <View className="gap-baking-header-gap">
              <Pressable accessibilityRole="button" className="flex-row items-center"
                onPress={game.handleExitOpen}>
                <View className="-rotate-90"><AngleUpIcon /></View>
                <Text variant="body-s">게임 나가기</Text>
              </Pressable>
              <View className="items-center">
                <Text variant="heading-h4">오늘의 미션: 소금빵 3개 팔기</Text>
                <Text variant="body-s">보상: 🥐 x1</Text>
              </View>
            </View>
            <GameFrame heightClassName="h-baking-frame">
              <View className="flex-1 bg-pink-100">
                {isShaping ? <BakingShapingScene state={state} enabled={game.isRunning} onAction={game.dispatch} />
                  : isOven ? <BakingOvenScene state={state} enabled={game.isRunning} onAction={game.dispatch} />
                  : <BakingMixingScene state={state} enabled={game.isRunning} onAction={game.dispatch} />}
                <View className="absolute right-baking-timer-right top-baking-timer-top" pointerEvents="none">
                  <Text className="text-pink-500" style={miniGameCounterStyle}>
                    {formatBakingTime(state.remainingMs)}
                  </Text>
                </View>
                {/* Sprites carry zIndex 1 (10 while dragged), so the overlays need a higher layer to dim them. */}
                {state.phase === 'ready' && (
                  <View className="absolute inset-0 z-20"><ReadyOverlay onPress={game.handleStart} /></View>
                )}
                {state.phase === 'fail' && (
                  <View className="absolute inset-0 z-20">
                    <ResultOverlay success={false} onPress={game.handleRestart} />
                  </View>
                )}
              </View>
            </GameFrame>
          </View>
          <View className="h-baking-footer-gap" />
          <View className="w-baking-content">
            <Button label="게임 설명" variant="gameInfo" onPress={handleHelpOpen} />
          </View>
          <View className="h-baking-top" />
        </View>
      </ScrollView>
      <ConfirmModal visible={game.isExitVisible} message="게임을 나가면 만들던 빵이 초기화돼요. 나갈까요?"
        confirmLabel="나가기" onConfirm={handleExit} onCancel={game.handleExitClose} />
      {/* Mission success (3 loaves): Figma 7962:6087. Tap anywhere closes and restarts, like before. */}
      <NoticeModal visible={state.phase === 'success'} title="SUCCESS!"
        message="소금빵 만들기에 성공했어요" onClose={game.handleRestart} />
      {/* Burnt or raw loaf: Figma 7962:6094 / 7962:6101. Tap → the next loaf starts from flour. */}
      <NoticeModal visible={ovenFailMessage !== ''} title="FAIL" message={ovenFailMessage}
        onClose={game.handleOvenResultClose} />
      {/* Baked loaf, shown after it sits on the tray a moment: Figma 8025:3848 with the user's copy. */}
      <NoticeModal visible={isBakedNoticeShown(state)}
        message={getBakedNoticeMessage(state.bakedCount, BAKING_RULES.targetCount)}
        onClose={game.handleOvenResultClose} />
      {/* Wrong order: Figma 8025:3848–3883, 7958:5971. */}
      <NoticeModal visible={state.notice !== null}
        message={state.notice ? BAKING_NOTICE_MESSAGES[state.notice] : ''} onClose={game.handleNoticeClose} />
      {/* Figma 7958:5971 layout; copy confirmed by the user (2026-10-29). */}
      <NoticeModal visible={state.step === 'shape' && state.shaping.failed}
        message="방향에 맞춰서 드래그해주세요!" onClose={game.handleShapeRetry} />
    </Screen>
  );
}
