import type { InfernoConversation } from '@/src/features/inferno/types';

/**
 * 러빈지옥 대화 데이터 출입구.
 *
 * 지금은 아래 상수를 그대로 돌려주지만, 서버가 생기면 이 파일만 fetch 로 바꾸면 된다.
 * 화면과 컴포넌트는 이 모듈을 직접 부르지 않고 use-inferno-conversation 훅을 거치므로,
 * 여기서 동기가 비동기로 바뀌어도 고칠 곳은 훅 하나뿐이다(§11).
 */

/**
 * "다시 굽기" 대화(`InfernoRebake.chatMessages`)에서 상대 쪽 줄에 쓰는 자리표시자
 * participantId. 다시 굽기 상대는 투표로 골라 정해지는 값이라 데이터가 미리 실제
 * participant id 를 넣어 둘 수 없다. 화면(ep4.tsx)이 투표 결과로 고른 참가자를
 * 이 id 로 감싸 참가자 목록에 끼워 넣은 뒤 그대로 렌더링한다.
 */
export const EP4_REBAKE_PARTNER_ID = 'rebakePartner';

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

/**
 * ep4 대화. Figma `ep4-매칭전 전체대화`(5467:4661), `ep4-매칭`(5467:5196),
 * `ep4-대화`(5449:1735), `ep4-끝`(5467:5675).
 *
 * ep2 와 뼈대가 같다 — 투표 없이 저희끼리 나누는 전체대화 한 쪽 뒤에 매칭 결과 쪽지가 뜨고,
 * 그걸 닫으면 매칭 상대(도넛)와의 1:1 대화로 이어진다. 매칭 결과 문구와 완료 쪽지 문구는
 * ep2 와 글자까지 같다(시안 그대로).
 */
const EP4_CONVERSATION: InfernoConversation = {
  episodeOrder: 4,
  participants: [
    { id: 'me', type: 'salt', name: '고소한 소금빵 반죽', isMine: true },
    { id: 'castella', type: 'castella', name: '유쾌한 카스테라 반죽', isMine: false },
    { id: 'donut', type: 'donut', name: '차가운 도넛 반죽', isMine: false },
    { id: 'pretzel', type: 'pretzel', name: '엉뚱한 프레첼 반죽', isMine: false },
  ],
  pages: [
    {
      id: 'ep4-p1',
      messages: [
        {
          id: 'ep4-p1-1',
          participantId: 'castella',
          side: 'left',
          text: '이번에는 저도 소금빵님과 대화 해보고 싶어요ㅠㅠ',
        },
        {
          id: 'ep4-p1-2',
          participantId: 'donut',
          side: 'left',
          text: '소금빵님 인기 많네요 성격이 워낙 밝고 좋으셔서 그런가봐요',
        },
        {
          id: 'ep4-p1-3',
          participantId: 'pretzel',
          side: 'right',
          text: '근데 소금빵님은 도넛 반죽 또 선택하실것 같아요...ㅎㅎ',
        },
      ],
    },
  ],
  matchReveal: {
    noticeMessage: '쫀쫀한 소금빵 반죽 → 차가운 도넛 반죽',
    actionLabel: '도넛 반죽과 오븐 가기',
  },
  // 1:1 대화에서 내 분신(소금빵)이 두 줄, 도넛이 두 줄 주고받는다. 결정적인 한 줄(마지막
  // 줄)에만 하트가 붙는다(시안 5467:5693).
  personalChatPages: [
    {
      id: 'ep4-personal-p1',
      messages: [
        {
          id: 'ep4-personal-p1-1',
          participantId: 'me',
          side: 'right',
          text: '안녕하세요!! 제가 또 도넛님 투표했어요!',
        },
        {
          id: 'ep4-personal-p1-2',
          participantId: 'donut',
          side: 'left',
          text: '저도 소금빵님과 더 대화해보고 싶었어요',
        },
        {
          id: 'ep4-personal-p1-3',
          participantId: 'me',
          side: 'right',
          text: '헐 진짜요?? 왜요?',
        },
        {
          id: 'ep4-personal-p1-4',
          participantId: 'donut',
          side: 'left',
          text: '관심 있어서요 계속 알아가고 싶어요',
          showHeart: true,
        },
      ],
    },
  ],
  // 후보는 ep1 투표의 네 반죽 중 나(me)와 이미 매칭된 상대(donut)를 뺀 나머지다. 대화 문구는
  // 상대가 누구든 같다(시안 5467:5876 이 프레첼로 예시를 보였을 뿐, 이름을 짚지 않는
  // 내용이라 카스테라를 골라도 그대로 쓴다) — 이유는 EP4_REBAKE_PARTNER_ID 주석 참고.
  rebake: {
    confirmMessage: '다시 굽기를 진행하시겠어요?',
    confirmActionLabel: '다시 굽기 상대 고르기',
    voteMessage: '당신과 다시 구워지고 싶어요',
    candidateIds: ['castella', 'pretzel'],
    chatMessages: [
      {
        id: 'ep4-rebake-1',
        participantId: 'me',
        side: 'right',
        text: '안녕하세요! 쫀쫀한 소금빵 반죽입니다',
      },
      {
        id: 'ep4-rebake-2',
        participantId: EP4_REBAKE_PARTNER_ID,
        side: 'left',
        text: '헐 안녕하세요 드디어 대화 해보네요',
      },
      {
        id: 'ep4-rebake-3',
        participantId: 'me',
        side: 'right',
        text: '저랑 대화 하고 싶으셨던 이유를 들어봐도 될까요?',
      },
      {
        id: 'ep4-rebake-4',
        participantId: EP4_REBAKE_PARTNER_ID,
        side: 'left',
        text: '그냥 이성이잖아요 ㅋㅋ',
      },
    ],
  },
};

/** 회차별 대화. 회차가 늘면 여기에 추가한다. */
const CONVERSATIONS: Record<number, InfernoConversation | undefined> = {
  1: EP1_CONVERSATION,
  4: EP4_CONVERSATION,
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
