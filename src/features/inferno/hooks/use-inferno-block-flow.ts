/** [DRAFT] Cursor is session-only, matching the lifetime of choice history. */
import { useState } from 'react';
import type { StoryBlock } from '@/src/features/inferno/types/story';
import { isPairWithPartner } from '@/src/features/inferno/utils/story-playlist';
const STRIDE = 1000;
/**
 * 블록 하나가 몇 걸음인지. 대화는 한 줄씩 넘기지만, 상대가 있는 1:1 장면은 기존 1:1 대화
 * 화면(InfernoPairScene)이 한 쪽에 다 보여주므로 한 걸음이다.
 */
function stepsOf(block: StoryBlock | undefined): number {
  if (!block || !('messages' in block)) return 1;
  return isPairWithPartner(block) ? 1 : block.messages.length;
}
/**
 * 생성 중에 받은 블록을 다 보면(`hasMore`) 회차를 끝내지 않고 다음 블록 자리로 넘어가 기다린다(`waiting`).
 * 그 자리에는 블록이 없어서 본문이 생성 대기 화면을 그리고, 블록이 붙으면 그대로 이어서 재생한다.
 */
export default function useInfernoBlockFlow(
  initial: number,
  blocks: StoryBlock[],
  onComplete: () => void,
  hasMore = false,
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
    if (line + 1 < stepsOf(block)) setPosition(position + 1);
    else if (blockIndex + 1 < blocks.length || hasMore) setPosition((blockIndex + 1) * STRIDE);
    else onComplete();
  }
  const lastIndex = blocks.length - 1;
  return {
    position,
    block,
    line,
    ready,
    next,
    /** 받은 블록을 다 보고 다음 블록을 기다리는 중. */
    waiting: blocks.length > 0 && blockIndex >= blocks.length,
    /** 마지막 블록의 마지막 줄로 간다. 기다리던 중에 생성이 끝나 더 올 블록이 없을 때 쓴다. */
    goToEnd: () => setPosition(lastIndex * STRIDE + Math.max(0, stepsOf(blocks[lastIndex]) - 1)),
    selected: () => setPosition((blockIndex + 1) * STRIDE),
    /** 서버가 409 CHOICE_REQUIRED 로 돌려보낼 때 선택 블록으로 되돌아간다. */
    goToBlock: (index: number) => setPosition(index * STRIDE),
    markReady: () => setReadyPosition(position),
    previous:
      block?.type === 'choice_result'
        ? undefined
        : line > 0
          ? () => setPosition(position - 1)
          : blockIndex > 0
            ? () => {
                const lastLine = Math.max(0, stepsOf(blocks[blockIndex - 1]) - 1);
                setPosition((blockIndex - 1) * STRIDE + lastLine);
              }
            : undefined,
  };
}
