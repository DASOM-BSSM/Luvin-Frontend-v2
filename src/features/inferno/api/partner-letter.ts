import type { InfernoPartnerLetter, InfernoPartnerLetterSender } from '@/src/features/inferno/types';
import { pickRandomItem } from '@/src/features/inferno/utils/partner-letter';

/**
 * EP5 이후 최종 매칭 상대가 보내는 쪽지 데이터 출입구.
 *
 * [MOCK] 실제로는 AI 가 상대 분신의 말투로 매번 다른 쪽지를 써 준다(사용자 결정). 아직 API 가
 * 없어서 아래 문구 중 하나를 무작위로 골라 돌려준다. 엔드포인트가 생기면 이 함수 안만 바꾸면 되고,
 * 부르는 쪽(use-partner-letter.ts)은 그대로 둔다(§11, season-summary.ts 와 같은 방식).
 */

/** [MOCK] AI 응답을 기다리는 시간을 흉내 낸다. 로딩 상태를 기기에서 확인할 수 있게 둔다. */
const MOCK_RESPONSE_DELAY_MS = 800;

/** [MOCK] AI 가 써 줄 쪽지 본문 예시. 실제 문구는 AI 가 정하므로 여기 문구는 임시다. */
const MOCK_LETTER_MESSAGES = [
  '이번 시즌 내내 네 생각뿐이었어. 다음에도 우리 타이밍이 맞았으면 좋겠다.',
  '처음엔 그냥 스쳐 가는 인연인 줄 알았는데, 마지막까지 네가 남아 줘서 고마워.',
  '네가 먼저 말 걸어 줬던 그 순간, 아직도 가끔 떠올라. 그때 대답 늦어서 미안했어.',
  '솔직히 중간에 조금 서운했던 적도 있었어. 그래도 결국 너라서 다행이야.',
  '우리 대화가 끝난 게 아쉬워서 몰래 쪽지 남겨. 다음엔 내가 먼저 다가갈게.',
  '타이밍이 다는 아니라지만, 이번엔 우리 타이밍이 꽤 괜찮았던 것 같아.',
];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchPartnerLetter(
  sender: InfernoPartnerLetterSender,
): Promise<InfernoPartnerLetter> {
  await wait(MOCK_RESPONSE_DELAY_MS);

  return {
    partnerName: sender.partnerName,
    message: pickRandomItem(MOCK_LETTER_MESSAGES, Math.random()),
  };
}
