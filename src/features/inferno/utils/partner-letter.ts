import type {
  InfernoFinalMatchResult,
  InfernoPartnerLetterSender,
} from '@/src/features/inferno/types';

/**
 * EP5 의 최종 매칭 상대로 쪽지 보낸 사람을 만든다. `id` 는 쪽지 한 통을 가리키는 값이라
 * 부르는 쪽이 넘긴다(보통 지금 시각) — 이 함수가 시계를 직접 읽지 않게 해 두면 결과가 입력만으로 정해진다.
 */
export function buildPartnerLetterSender(
  finalMatch: InfernoFinalMatchResult,
  id: string,
): InfernoPartnerLetterSender {
  return {
    id,
    partnerName: finalMatch.profile.name,
    partnerType: finalMatch.profile.type,
  };
}

/**
 * 목록에서 하나를 고른다. `random` 은 0 이상 1 미만(`Math.random()`) — 무작위 값을 밖에서 받아서
 * 같은 입력이면 같은 결과가 나온다. 목록은 비어 있지 않아야 한다.
 */
export function pickRandomItem<T>(items: readonly T[], random: number): T {
  const index = Math.min(Math.floor(random * items.length), items.length - 1);

  return items[index] as T;
}
