import { router, usePathname } from 'expo-router';
import { BackHandler, Pressable, ScrollView, View } from 'react-native';
import { useEffect } from 'react';

import AngleUpIcon from '@/src/assets/icons/AngleUpIcon';
import Button from '@/src/components/ui/button';
import ConfirmModal from '@/src/components/ui/confirm-modal';
import NoticeModal from '@/src/components/ui/notice-modal';
import Screen from '@/src/components/ui/screen';
import Text from '@/src/components/ui/text';
import BakingMixingScene from '@/src/features/bread-baking/components/baking-mixing-scene';
import BakingOvenScene from '@/src/features/bread-baking/components/baking-oven-scene';
import BakingShapingScene from '@/src/features/bread-baking/components/baking-shaping-scene';
import useBakingGame from '@/src/features/bread-baking/hooks/use-baking-game';
import useReportMinigameResult from '@/src/features/minigames/hooks/use-report-minigame-result';
import {
  BAKING_MINIGAME_CODE, BAKING_RULES, formatBakingTime,
} from '@/src/features/bread-baking/utils/game';
import { BAKING_HELP, getBakingInstruction } from '@/src/features/bread-baking/utils/instructions';
import GameFrame from '@/src/features/luvin-hell/components/GameFrame';
import ReadyOverlay from '@/src/features/luvin-hell/components/ReadyOverlay';
import ResultOverlay from '@/src/features/luvin-hell/components/ResultOverlay';

/** Figma 5726:2608 → 7966:6180 → 7966:6239. Assets: 7975:2356. */
export default function BreadBakingPlayScreen() {
  const pathname = usePathname();
  const game = useBakingGame(pathname === '/luvin-hell/bread-baking/play');
  const { state } = game;
  // 미션 성공/실패를 서버에 한 번 보고하고, 성공 보상 토큰은 응답대로 잔액 캐시에 반영된다.
  useReportMinigameResult(BAKING_MINIGAME_CODE, state.phase, 'code');
  const isShaping = ['roll', 'filling', 'shape', 'sprinkle'].includes(state.step);
  const isOven = ['load', 'bake', 'serve'].includes(state.step);

  function handleExit() {
    if (router.canGoBack()) router.back();
    else router.replace('/luvin-hell');
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
            <GameFrame>
              <View className="flex-1 bg-pink-100">
                {isShaping ? <BakingShapingScene state={state} enabled={game.isRunning} onAction={game.dispatch} />
                  : isOven ? <BakingOvenScene state={state} enabled={game.isRunning} onAction={game.dispatch} />
                  : <BakingMixingScene state={state} enabled={game.isRunning} onAction={game.dispatch} />}
                <View className="absolute right-baking-timer-right top-baking-timer-top" pointerEvents="none">
                  <Text variant="display-score">{`T: ${formatBakingTime(state.remainingMs)}`}</Text>
                </View>
                {state.phase === 'ready' && <ReadyOverlay onPress={game.handleStart} />}
                {state.phase === 'fail' && <ResultOverlay success={false} onPress={game.handleRestart} />}
              </View>
            </GameFrame>
          </View>
          <View className="h-baking-footer-gap" />
          <View className="w-baking-content">
            <Button label="게임 설명" variant="gameInfo" onPress={game.handleHelpOpen} />
          </View>
          <View className="h-baking-top" />
        </View>
      </ScrollView>
      <ConfirmModal visible={game.isHelpVisible}
        message={`${getBakingInstruction(state)}\n\n완성: ${state.bakedCount}/${BAKING_RULES.targetCount}\n\n${BAKING_HELP}`}
        confirmLabel="계속하기" cancelLabel="닫기" onConfirm={game.handleHelpClose} onCancel={game.handleHelpClose} />
      <ConfirmModal visible={game.isExitVisible} message="게임을 나가면 만들던 빵이 초기화돼요. 나갈까요?"
        confirmLabel="나가기" onConfirm={handleExit} onCancel={game.handleExitClose} />
      {/* Mission success (3 loaves): Figma 7962:6087. Tap anywhere closes and restarts, like before. */}
      <NoticeModal visible={state.phase === 'success'} title="SUCCESS!"
        message="소금빵 만들기에 성공했어요" onClose={game.handleRestart} />
      {/* Figma 7958:5971 layout; copy confirmed by the user (2026-10-29). */}
      <NoticeModal visible={state.step === 'shape' && state.shaping.failed}
        message="방향에 맞춰서 드래그해주세요!" onClose={game.handleShapeRetry} />
    </Screen>
  );
}
