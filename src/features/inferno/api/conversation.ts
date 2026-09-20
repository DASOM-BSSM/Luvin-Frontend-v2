import type { InfernoConversation } from '@/src/features/inferno/types';

/**
 * 러빈지옥 대화 데이터 출입구.
 *
 * 지금은 아래 상수를 그대로 돌려주지만, 서버가 생기면 이 파일만 fetch 로 바꾸면 된다.
 * 화면과 컴포넌트는 이 모듈을 직접 부르지 않고 use-inferno-conversation 훅을 거치므로,
 * 여기서 동기가 비동기로 바뀌어도 고칠 곳은 훅 하나뿐이다(§11).
 */

/**
 * ep1 대화. Figma `ep1-전체대화` (5425:886), `ep1-전체대화 끝` (6137:2782),
 * `ep1-투표` (5466:4268), `ep1-투표지` (5452:1989).
 */
const EP1_CONVERSATION: InfernoConversation = {
  episodeOrder: 1,
  participants: [
    { id: 'me', type: 'salt', name: '고소한 소금빵 반죽', isMine: true },
    { id: 'castella', type: 'castella', name: '유쾌한 카스테라 반죽', isMine: false },
    { id: 'donut', type: 'donut', name: '차가운 도넛 반죽', isMine: false },
    { id: 'pretzel', type: 'pretzel', name: '엉뚱한 프레첼 반죽', isMine: false },
  ],
  pages: [
    {
      id: 'ep1-p1',
      question: '- 여러분은 사랑한다는 말에 집착하는 편인가요? -',
      messages: [
        {
          id: 'ep1-p1-1',
          participantId: 'me',
          side: 'right',
          text: '음... 저는 말보단 행동으로 보여줬으면 좋겠어요',
        },
        {
          id: 'ep1-p1-2',
          participantId: 'donut',
          side: 'left',
          text: '사랑하면 사랑한다는 말이 저절로 나온다고 생각해요',
        },
        {
          id: 'ep1-p1-3',
          participantId: 'pretzel',
          side: 'right',
          text: '저는 사랑한다고 꼭 말해줘야해요.. 아니면 불안해요',
        },
      ],
    },
    {
      id: 'ep1-p2',
      notice: '- 대화가 종료되었습니다 투표를 진행해주세요 -',
      messages: [
        {
          id: 'ep1-p2-1',
          participantId: 'castella',
          side: 'left',
          text: '아ㅋㅋㅋㅋ 많은 의미가 담겨있군요..',
        },
        {
          id: 'ep1-p2-2',
          participantId: 'me',
          side: 'right',
          text: '도넛님ㅋㅋㅋㅋㅋㅋㅋㅋ 원래 이렇게 웃긴 분이세요?',
        },
        {
          id: 'ep1-p2-3',
          participantId: 'donut',
          side: 'left',
          text: '네? 저는 웃길려고 한 말이 아니에요..',
        },
      ],
    },
  ],
  vote: {
    modalMessage: '더 알아가고 싶은 반죽을 골라주세요',
    ballotMessage: '당신과 단둘이 대화하고 싶어요',
  },
};

/** 회차별 대화. 회차가 늘면 여기에 추가한다. */
const CONVERSATIONS: Record<number, InfernoConversation | undefined> = {
  1: EP1_CONVERSATION,
};

/** 회차의 대화를 가져온다. 아직 대화가 없는 회차면 undefined. */
export function getInfernoConversation(order: number): InfernoConversation | undefined {
  return CONVERSATIONS[order];
}

/**
 * 투표 결과를 보낸다.
 *
 * 아직 보낼 곳이 없어서 아무 일도 하지 않는다. 화면이 지금부터 이 함수를 부르게 해 두면,
 * 서버가 생겼을 때 이 안만 채우면 된다. 결과가 필요해지는 시점(다음 회차에서 쓰거나
 * 화면에 되돌려 보여줘야 할 때)에 반환 타입을 붙일 것.
 */
export function submitInfernoVote(order: number, participantId: string): void {
  void order;
  void participantId;
}
