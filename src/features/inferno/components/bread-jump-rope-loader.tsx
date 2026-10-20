import { useEffect, useState } from 'react';

import BreadJumpRopeCard from '@/src/features/inferno/components/bread-jump-rope-card';

export interface BreadJumpRopeLoaderProps {
  /** 응답이 도착해 false가 되어도 퇴장이 끝날 때까지 컴포넌트를 마운트해 둔다. */
  active: boolean;
  onExitComplete?: () => void;
}

/**
 * AI 답장 대기. 러빈지옥 쪽지(InfernoNoteCard) 안을 가득 채운다. Figma 7219:3595.
 * 처음부터 비활성이면 표시·완료 콜백 없이 대기한다.
 */
export default function BreadJumpRopeLoader({ active, onExitComplete }: BreadJumpRopeLoaderProps) {
  const [hasExited, setHasExited] = useState(!active);

  useEffect(() => {
    if (active) setHasExited(false);
  }, [active]);

  function handleLoaderExitComplete() {
    setHasExited(true);
    onExitComplete?.();
  }

  if (!active && hasExited) return null;

  return <BreadJumpRopeCard active={active} onExitComplete={handleLoaderExitComplete} />;
}
