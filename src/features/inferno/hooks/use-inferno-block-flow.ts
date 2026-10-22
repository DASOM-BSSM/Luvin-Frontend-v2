/** [DRAFT] Cursor is session-only, matching the lifetime of choice history. */
import { useState } from 'react';
import type { SceneBlock } from '@/src/features/inferno/types/scene-block';
const STRIDE = 1000;
export default function useInfernoBlockFlow(
  initial: number,
  blocks: SceneBlock[],
  onComplete: () => void,
) {
  const [position, setPosition] = useState(initial);
  const [readyPosition, setReadyPosition] = useState<number>();
  const blockIndex = Math.floor(position / STRIDE);
  const line = position % STRIDE;
  const block = blocks[blockIndex];
  const ready =
    readyPosition === position ||
    block?.type === 'transition' ||
    (block && 'messages' in block && block.messages.length === 0);
  function next() {
    if (!block) return;
    if ('messages' in block && line + 1 < block.messages.length) setPosition(position + 1);
    else if (blockIndex + 1 < blocks.length) setPosition((blockIndex + 1) * STRIDE);
    else onComplete();
  }
  return {
    position,
    block,
    line,
    ready,
    next,
    selected: () => setPosition((blockIndex + 1) * STRIDE),
    markReady: () => setReadyPosition(position),
    previous:
      block?.type === 'choice_result'
        ? undefined
        : line > 0
          ? () => setPosition(position - 1)
          : blockIndex > 0
            ? () => {
                const previous = blocks[blockIndex - 1];
                const lastLine =
                  previous && 'messages' in previous
                    ? Math.max(0, previous.messages.length - 1)
                    : 0;
                setPosition((blockIndex - 1) * STRIDE + lastLine);
              }
            : undefined,
  };
}
