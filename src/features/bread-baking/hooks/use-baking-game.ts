import { useEffect, useReducer, useState } from 'react';
import { AppState } from 'react-native';

import {
  BAKING_RULES, bakingReducer, createBakingState, isBakedNoticeShown, isOvenFailShown,
} from '@/src/features/bread-baking/utils/game';

/** Lifecycle only; rules and stage transitions live in the pure reducer. */
export default function useBakingGame(isScreenActive: boolean) {
  const [state, dispatch] = useReducer(bakingReducer, undefined, createBakingState);
  const [isForeground, setIsForeground] = useState(AppState.currentState === 'active');
  const [isExitVisible, setIsExitVisible] = useState(false);
  const isRunning = state.phase === 'playing' && isScreenActive && isForeground
    && !isExitVisible && !state.shaping.failed && !state.notice && !isOvenFailShown(state)
    && !isBakedNoticeShown(state);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    function handleAppStateChange(nextState: string) {
      setIsForeground(nextState === 'active');
    }
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    let previousTime = performance.now();
    const timer = setInterval(handleTick, BAKING_RULES.tickMs);
    function handleTick() {
      const now = performance.now();
      dispatch({ type: 'tick', elapsedMs: now - previousTime });
      previousTime = now;
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  function handleStart() { dispatch({ type: 'start' }); }
  function handleRestart() { dispatch({ type: 'restart' }); }
  function handleExitOpen() { setIsExitVisible(true); }
  function handleExitClose() { setIsExitVisible(false); }
  function handleNoticeClose() { dispatch({ type: 'dismiss-notice' }); }
  // Closing a FAIL or baked note sends the loaf off like a finished one and starts the next from flour.
  function handleOvenResultClose() { dispatch({ type: 'serve' }); }
  function handleShapeRetry() { dispatch({ type: 'shape-retry' }); }

  return { state, dispatch, isRunning, isExitVisible, handleStart, handleRestart,
    handleExitOpen, handleExitClose, handleNoticeClose, handleOvenResultClose, handleShapeRetry };
}
