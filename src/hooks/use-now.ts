import { useEffect, useState } from 'react';

/**
 * 남은 시간 표시용 현재 시각. `active` 가 true 가 되면 바로 한 번 갱신하고 `intervalMs` 마다 다시 갱신한다.
 * 화면이 오래 떠 있다가 켜져도 옛 시각으로 남은 시간을 계산하지 않도록, 켜지는 순간 새로 읽는다.
 */
export default function useNow(active: boolean, intervalMs = 30 * 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const first = setTimeout(() => setNow(Date.now()), 0);
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [active, intervalMs]);

  return now;
}
