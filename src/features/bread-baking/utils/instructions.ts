import type { BakingState, BakingStep } from '@/src/features/bread-baking/types';

/** Copy follows the user-approved recipe; gesture details describe the current implementation. */
const INSTRUCTIONS: Record<BakingStep, string> = {
  prepare: '빈 그릇은 준비되어 있어요. 시작하면 밀가루부터 넣어주세요.',
  flour: '밀가루를 그릇으로 끌어다 넣어주세요.',
  eggs: '계란을 그릇으로 끌어다 넣어주세요.',
  'mix-first': '거품기를 그릇으로 옮겨 움직인 뒤 놓아주세요.',
  butter: '버터를 그릇으로 끌어다 넣어주세요.',
  water: '물을 그릇으로 끌어다 넣어주세요.',
  'mix-second': '거품기를 그릇으로 옮겨 다시 섞어주세요.',
  salt: '소금을 그릇으로 끌어다 넣어주세요.',
  sugar: '설탕을 그릇으로 끌어다 넣어주세요.',
  yeast: '이스트를 그릇으로 끌어다 넣어주세요.',
  'mix-final': '거품기를 그릇으로 옮겨 반죽을 섞어주세요.',
  transfer: '반죽이 담긴 그릇을 도마로 끌어다 옮겨주세요.',
  roll: '밀대를 도마 위로 옮겨 움직인 뒤 놓아주세요.',
  filling: '버터를 도마 위 반죽으로 끌어다 넣어주세요.',
  shape: '화살표 방향으로 반죽을 드래그해서 말아주세요.',
  sprinkle: '소금을 반죽 위로 끌어다 뿌려주세요.',
  load: '트레이 위 반죽을 오븐으로 끌어다 넣어주세요.',
  bake: '타이머 바늘이 초록 칸에 왔을 때 오븐을 눌러 빵을 꺼내주세요.',
  serve: '소금빵 완성! 다음 빵을 준비해요.',
};

/** A failed loaf is held on the serve step too; it points to the restart, not the "완성" copy. */
export function getBakingInstruction({ step, ovenResult }: BakingState): string {
  if (step === 'serve' && ovenResult !== 'baked') return INSTRUCTIONS.flour;
  return INSTRUCTIONS[step];
}

export const BAKING_HELP = '빈 그릇 준비 → 밀가루·계란 섞기 → 버터·물 섞기 → 소금·설탕·이스트 섞기 → 도마에서 밀고 버터를 넣어 화살표 방향대로 성형하기 → 소금 뿌리기 → 오븐에서 굽기.\n\n재료와 도구를 드래그해요. 타이머 바늘이 초록 칸에 왔을 때 오븐을 누르면 완성돼요. 타이밍을 놓치면 그 빵부터 다시 만들어요.';
