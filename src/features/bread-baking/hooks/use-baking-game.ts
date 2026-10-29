import { useEffect, useReducer, useState } from 'react';
import { AppState } from 'react-native';

import { BAKING_RULES, bakingReducer, createBakingState } from '@/src/features/bread-baking/utils/game';
import { createShapeArrows } from '@/src/features/bread-baking/utils/shaping';

/** Lifecycle only; rules and stage transitions live in the pure reducer. */
export default function useBakingGame(isScreenActive: boolean) {
  const [state, dispatch] = useReducer(bakingReducer, undefined, createBakingState);
  const [isForeground, setIsForeground] = useState(AppState.currentState === 'active');
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [isExitVisible, setIsExitVisible] = useState(false);
  const isRunning = state.phase === 'playing' && isScreenActive && isForeground
    && !isHelpVisible && !isExitVisible && !state.shaping.failed;

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
  function handleHelpOpen() { setIsHelpVisible(true); }
  function handleHelpClose() { setIsHelpVisible(false); }
  function handleExitOpen() { setIsExitVisible(true); }
  function handleExitClose() { setIsExitVisible(false); }
  function handleShapeRetry() { dispatch({ type: 'shape-retry', arrows: createShapeArrows(Math.random) }); }

  return { state, dispatch, isRunning, isHelpVisible, isExitVisible, handleStart,
    handleRestart, handleHelpOpen, handleHelpClose, handleExitOpen, handleExitClose, handleShapeRetry };
}
