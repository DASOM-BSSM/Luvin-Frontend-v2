import { useState } from 'react';

/** 값이 바뀌면 `key` 로 컴포넌트를 새로 세워 처음부터 다시 재생시키는 용도. */
export default function useReplayKey() {
  const [replayKey, setReplayKey] = useState(0);

  function replay() {
    setReplayKey((current) => current + 1);
  }

  return { replayKey, replay };
}
