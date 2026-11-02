/** [DRAFT] Ten episodes. Shared events have separate romance/solo dialogue scripts. */
import { CANDIDATE_IDS, PERSONAS, SCENE_CAST } from '@/src/features/inferno/api/mocks/scene-cast';
import { EPISODE_TRANSITIONS, GROUP_ROOM_NAMES } from '@/src/features/inferno/api/mocks/story-settings';
import type { InfernoChatMessage } from '@/src/features/inferno/types';
import type {
  ChoiceBlock,
  ChoicePoint,
  ChoiceRecord,
  EpisodeContent,
  SceneBlock,
  SceneSeasonState,
} from '@/src/features/inferno/api/mocks/mock-scene-types';
import type { SeasonSetting } from '@/src/features/inferno/types/story';

type Line = [string, string];
export function dialogue(
  id: string,
  type: 'pair' | 'group',
  lines: Line[],
): SceneBlock {
  return {
    id,
    type,
    participants:
      type === 'group'
        ? SCENE_CAST
        : SCENE_CAST.filter((person) => lines.some(([speaker]) => speaker === person.id)),
    messages: lines.map(([participantId, text], index): InfernoChatMessage => ({
      id: `${id}-${index}`,
      participantId,
      text,
      side: participantId === 'me' ? 'right' : 'left',
    })),
  };
}
const QUESTIONS: Record<number, [ChoicePoint, string]> = {
  3: [1, '누구랑 더 얘기해보고 싶어?'],
  5: [2, '오늘 누구한테 연락해볼까?'],
  6: [3, '마음을 전하고 싶은 사람'],
  8: [4, '지금 누구랑 얘기하고 싶어?'],
};
/**
 * 회차마다 다 같이 나누는 전체대화. 예전 5화 대화를 끼워 쓰지 않고 회차 사건에 맞춰 새로 쓴다(사용자 결정 —
 * 옛 회차 규칙은 지우고 대화는 자유롭게). 출연진 누구든 말할 수 있고, 내 빵도 매 회차 대화에 낀다.
 */
const GROUP_LINES: Record<number, Line[]> = {
  1: [
    ['host', '어서 와요! 오늘부터 같은 반이에요. 다들 자기소개 한 번씩 해볼까요?'],
    ['castella', '반가워요. 모르는 거 있으면 편하게 물어봐요.'],
    ['me', '안녕! 아직 다 어색한데, 천천히 친해지고 싶어.'],
    ['pretzel', '오 나도! 우리 번호부터 교환할래?'],
    ['donut', '…반가워.'],
    ['friend', '얘 원래 처음엔 낯가려. 금방 친해질 거야.'],
  ],
  2: [
    ['host', '단톡방 만들려고 하는데, 다들 번호 알려줄 수 있어요?'],
    ['me', '좋아! 단톡 있으면 연락하기 훨씬 편하겠다.'],
    ['pretzel', '근데 단톡에서 답장 늦으면 좀 신경 쓰일 것 같아…'],
    ['castella', '각자 편할 때 답하기로 정하면 되죠.'],
    ['me', '맞아, 나도 답장 느릴 때 많아서 그게 편해.'],
    ['donut', '알림은 꺼둘게. 대신 다 읽긴 할게.'],
  ],
  3: [
    ['host', '오늘 청소 당번 누구였죠?'],
    ['me', '나랑… 둘이었던 것 같은데?'],
    ['friend', '오 잘됐다. 끝나고 같이 매점 가려 했는데 기다릴게.'],
    ['castella', '혼자 하기 힘들면 말해요. 도와줄게요.'],
    ['me', '괜찮아, 금방 끝낼 수 있을 것 같아.'],
  ],
  4: [
    ['host', '이번 축제 우리 반은 뭐 할지 정해야 해요!'],
    ['pretzel', '부스 꾸미는 거 하고 싶어! 같이 할 사람?'],
    ['me', '나는 포스터 만드는 거 해볼래.'],
    ['castella', '역할 겹치지 않게 칠판에 적어둘게요.'],
    ['donut', '…나는 남는 거 할게.'],
    ['friend', '너 포스터 잘 그리잖아. 기대된다.'],
  ],
  5: [
    ['friend', '너 얼굴 왜 이렇게 하얘? 어디 아파?'],
    ['me', '아침부터 머리가 좀 아파서… 괜찮아.'],
    ['castella', '무리하지 말고 보건실 가봐요. 선생님께 말해줄게요.'],
    ['pretzel', '헐 괜찮아?? 진짜 괜찮은 거 맞지?'],
    ['me', '응, 오늘은 조퇴하고 좀 쉬어야겠다.'],
    ['donut', '……조심히 가.'],
  ],
  6: [
    ['host', '드디어 축제 날이에요! 다들 고생 많았어요.'],
    ['me', '부스 생각보다 너무 예쁘게 나왔다.'],
    ['pretzel', '사진 찍자! 다 같이!'],
    ['friend', '오늘 하고 싶은 말 있으면 꼭 해. 응원할게.'],
    ['me', '…응. 오늘은 용기 내볼게.'],
  ],
  7: [
    ['host', '시험 기간이라 다들 바쁘죠? 단톡도 조용하네요.'],
    ['me', '요즘 연락이 뜸하니까 좀 멀어진 기분이야.'],
    ['castella', '바빠도 가끔은 안부 물어봐요.'],
    ['friend', '혼자 짐작하지 말고 그냥 물어보는 건 어때?'],
  ],
  8: [
    ['host', '반 행사 준비가 좀 엇갈렸네요. 다들 무슨 일 있었어요?'],
    ['me', '나는 다 같이 정한 줄 알고 기다렸는데…'],
    ['pretzel', '나도 바뀐 거 몰랐어. 미안해.'],
    ['friend', '누가 잘못했는지보다 뭐가 필요했는지 얘기해보자.'],
    ['me', '맞아. 서운했던 거 차분하게 말해볼게.'],
  ],
  9: [
    ['host', '체육대회 끝나고 다 같이 남아서 얘기 좀 해요.'],
    ['me', '좋아. 요즘 하고 싶은 말이 좀 있었어.'],
    ['castella', '다른 생각이어도 들어볼게요.'],
    ['donut', '…나도 할 말 있어.'],
  ],
  10: [
    ['host', '벌써 학기 마지막 날이네요. 다들 고마웠어요.'],
    ['me', '처음엔 어색했는데, 다들 덕분에 많이 웃었어.'],
    ['pretzel', '방학 때도 연락하자! 진짜로!'],
    ['friend', '누구를 고르는 것만큼 너 자신을 챙긴 것도 잘했어.'],
  ],
};
/**
 * 1~6화 1:1 대화. `partner` 는 그 회차 1:1 상대로 바뀐다(계약 v5 7장 표: 1·2·3화 후보 셋 순서대로,
 * 4화 선택 ①의 빵, 5화 친구, 6화 선택 ②의 빵).
 */
const PAIR_LINES: Record<number, Line[]> = {
  1: [
    ['partner', '아까 자기소개할 때 좀 긴장한 것 같던데, 괜찮았어?'],
    ['me', '티 났어? 처음이라 좀 떨렸어.'],
    ['partner', '나도 그래. 그래서 먼저 말 걸어보고 싶었어.'],
    ['me', '고마워. 덕분에 좀 편해졌다.'],
  ],
  2: [
    ['partner', '단톡에서는 말 잘 안 했는데, 이렇게 얘기하니까 좋다.'],
    ['me', '나도. 글로 하는 것보다 직접 말하는 게 편해.'],
    ['partner', '그럼 앞으로 종종 이렇게 얘기하자.'],
  ],
  3: [
    ['partner', '둘만 남으니까 좀 조용하네.'],
    ['me', '그러게. 그래서 오히려 솔직하게 말할 수 있을 것 같아.'],
    ['partner', '그럼 나도 하나만. 너랑 얘기하는 거 생각보다 재밌어.'],
    ['me', '…나도 그래.'],
  ],
  4: [
    ['me', '같이 준비하게 돼서 반가워. 어떤 거 하는 게 편해?'],
    ['partner', '천천히 의견 나누면서 하자. 너 포스터 하는 거 보고 싶어.'],
    ['me', '그럼 색깔은 같이 골라줘.'],
  ],
  5: [
    ['partner', '집에 잘 들어갔어? 약은 먹었고?'],
    ['me', '응, 좀 자고 나니까 나아졌어.'],
    ['partner', '아까 다들 걱정하더라. 근데 연락은 누가 했어?'],
    ['me', '음… 그건 좀 생각해볼래.'],
  ],
  6: [
    ['partner', '축제 끝나니까 좀 허전하다.'],
    ['me', '응… 근데 오늘 꼭 하고 싶은 말이 있었어.'],
    ['partner', '뭔데? 천천히 말해도 돼.'],
  ],
};
/** 1·2·3화 1:1 상대 — 후보 셋을 순서대로 한 명씩 만난다(계약 v5 7장). */
const FIRST_MEETINGS: Record<number, string> = { 1: CANDIDATE_IDS[0], 2: CANDIDATE_IDS[1], 3: CANDIDATE_IDS[2] };
const ROMANCE: Record<number, Line[]> = {
  7: [
    ['me', '요즘 바빠서 연락이 줄었는데, 언제 이야기하면 편할까요?'],
    ['partner', '저녁에 짧게 안부를 나누면 좋겠어요. 미리 말하지 못했네요.'],
  ],
  8: [
    ['me', '약속이 바뀐 걸 늦게 알아서 서운했어요.'],
    ['partner', '혼자 괜찮겠거니 생각했어요. 네 마음을 듣고 싶어요.'],
  ],
  9: [
    ['me', '늦어질 때 한 줄만 알려주면 마음이 편할 것 같아요.'],
    ['partner', '그렇게 해볼게요. 너도 쉬고 싶을 땐 말해줘요.'],
  ],
  10: [
    ['me', '마음이 같아도 속도는 다를 수 있다는 걸 배웠어요.'],
    ['partner', '앞으로도 추측하기보다 물어보며 알아가고 싶어요.'],
  ],
};
const SOLO: Record<number, Line[]> = {
  7: [
    ['me', '모임이 뜸해지니 혼자 남은 느낌이 들었어.'],
    ['friend', '혼자 있는 시간이 외로움으로만 남지 않게 우리 가끔 안부를 나누자.'],
  ],
  8: [
    ['me', '다 같이 정한 약속인데 나만 기다린 것 같아.'],
    ['conflict', '일정이 바뀐 걸 미리 알려주지 못했어. 서로 이야기해보자.'],
  ],
  9: [
    ['me', '계획이 바뀔 땐 서로 미리 알려주면 좋겠어.'],
    // 8화에서 고른 상대가 9화 첫 장면에 나와야 한다. 친구를 골랐으면 그대로 친구다.
    ['partner', '좋아. 참석이 어려워도 부담 없이 말하기로 하자.'],
  ],
  10: [
    ['me', '혼자 지내는 선택도 나를 이해하는 시간이 됐어.'],
    ['friend', '누군가와 이어지지 않아도 우리에게 남은 관계가 있잖아.'],
  ],
};
const MEMORIES: Record<number, string[]> = {
  3: [
    '내 말을 끝까지 들어줌',
    '둘만 남았을 때 솔직하게 이야기함',
    '같이 정리하며 먼저 말을 걸어줌',
  ],
  5: [
    '힘들었던 일을 기억하고 먼저 챙겨줌',
    '신경은 쓰였지만 연락을 망설였다고 말함',
    '연락이 잦았던 점을 돌아보고 사과함',
  ],
  6: [
    '축제 준비를 꾸준히 함께함',
    '말은 적었지만 축제 준비를 도와줌',
    '부담을 주지 않는 표현을 연습함',
  ],
};
/** 8화 선택 ④ 후보의 기억 한 줄. 다툰 상대가 맨 앞, 나머지는 출연진 순서. */
const OPEN_VOTE_MEMORIES: Record<string, string> = {
  friend: '내 고민을 들어준 친구',
  host: '반 행사를 같이 준비함',
  castella: '먼저 안부를 물어봐 줌',
  donut: '말은 적어도 곁에 있었음',
  pretzel: '연락을 자주 해줬음',
};
function choiceFor(order: number, state: SceneSeasonState): ChoiceBlock | undefined {
  const spec = QUESTIONS[order];
  if (!spec) return undefined;
  if (order === 8) {
    // 8화는 내 빵을 뺀 출연진 다섯이 모두 후보다(사용자 결정). 다툰 상대를 맨 앞에 둔다.
    const conflict = state.choices.find((choice) => choice.pointId === 3)?.breadId ?? 'castella';
    const others = SCENE_CAST.filter((person) => !person.isMine && person.id !== conflict);
    return {
      pointId: spec[0],
      question: spec[1],
      candidates: [conflict, ...others.map((person) => person.id)].map((breadId) => ({
        breadId,
        memory:
          breadId === conflict ? '약속이 엇갈린 상대' : (OPEN_VOTE_MEMORIES[breadId] ?? ''),
      })),
    };
  }
  return {
    pointId: spec[0],
    question: spec[1],
    candidates: CANDIDATE_IDS.map((breadId, index) => ({ breadId, memory: MEMORIES[order]?.[index] ?? '' })),
  };
}
export function choiceResultBlocks(record: ChoiceRecord): SceneBlock[] {
  const persona = record.breadId ? PERSONAS[record.breadId] : undefined;
  const text =
    record.breadId === null
      ? '지금은 내 마음을 먼저 돌보고 싶어요.'
      : record.accepted
        ? record.pointId === 2 && persona === 'avoidant'
          ? '잠깐은 괜찮아요. 오늘은 먼저 마무리해야 할 것 같아요.'
          : '좋아요. 우리 편하게 이야기해요.'
        : persona === 'avoidant'
          ? '미안해요. 요즘 조금 바빠서요. 오늘은 어렵겠어요.'
          : persona === 'anxious'
            ? '미안해요. 지금은 마음을 정리할 시간이 필요해요.'
            : '고마워요. 지금은 같은 마음으로 답하기 어려워요. 다른 때 편하게 이야기해요.';
  const result: SceneBlock = {
    id: `result-${record.pointId}`,
    type: 'choice_result',
    result: record,
    participants: SCENE_CAST,
    messages: [
      {
        id: `reaction-${record.pointId}`,
        participantId: record.breadId ?? 'me',
        side: 'left',
        text,
      },
    ],
  };
  return record.breadId === null
    ? [
        result,
        dialogue(`solo-${record.pointId}`, 'pair', [
          [
            'me',
            record.pointId === 2
              ? '오늘은 아무에게도 연락하지 않고 쉬어야겠어.'
              : '오늘은 내 마음을 천천히 정리해볼래.',
          ],
        ]),
      ]
    : !record.accepted
      ? [
          result,
          dialogue(`fallback-${record.pointId}`, 'pair', [
            ['me', '아쉽지만 상대의 마음을 존중하고 싶어.'],
            ['friend', '괜찮아. 네가 이야기하고 싶을 때 내가 들어줄게.'],
          ]),
        ]
      : [result];
}
/**
 * 1:1 상대와의 개인톡(messenger direct)이 있는 회차(사용자 결정). 1·3화는 톡방이 필요하면 넣으라는
 * 요청으로 더했다. 5화는 아래 CANDIDATE_CHECK_INS 로 따로 둔다.
 */
const PARTNER_DIRECT_ORDERS = [1, 3, 4, 6, 7, 9];
/**
 * 10화 인터뷰에서 그 빵이 **내 빵**에 대해 하는 답(목 문구). 행동으로만 말하고 애착 유형 이름은 쓰지 않는다.
 * 내 빵 이름은 사용자마다 달라서 "너"로 부른다.
 */
const INTERVIEW_ANSWERS: Record<string, string> = {
  castella: '힘들 때 먼저 말해주면 늘 같이 고민해주던 반죽이었어요',
  donut: '제가 말이 적어도 재촉하지 않고 기다려준 반죽이었어요',
  pretzel: '연락이 늦어도 꼭 답해줘서 마음이 놓이던 반죽이었어요',
  friend: '누구를 고르든 자기 마음을 먼저 챙길 줄 아는 반죽이었어요',
};
/** 시즌 중에 나를 거절한 빵의 답. */
const INTERVIEW_REJECTED_ANSWERS: Record<string, string> = {
  castella: '제가 거절했는데도 솔직하게 받아줘서 고마운 반죽이었어요',
  donut: '저랑 엇갈리긴 했지만 제 이야기를 끝까지 들어준 반죽이었어요',
  pretzel: '제가 거절해서 미안했지만, 그래도 계속 다정했던 반죽이었어요',
};
/** 단톡방(messenger group)이 있는 회차. 2화 사건이 "단톡방이 생겼다"라서 둔다. 1:1 보다 앞(전환 쪽지 전)에 온다. */
const GROUP_ROOM_ORDERS = [2];
/** 개인톡 첫 줄(1:1 상대가 보낸다). 회차 사건에 맞춘 임시 문구. */
const DIRECT_OPENERS: Record<number, string> = {
  1: '오늘 처음 봤는데 이야기 잘 통해서 좋았어요.',
  3: '아까 둘이 정리하면서 이야기한 거, 계속 생각나요.',
  4: '오늘 나눈 이야기를 기억하고 있어요.',
  6: '오늘 나눈 이야기를 기억하고 있어요.',
  7: '오늘은 늦게 답하게 될 것 같아요. 미리 알려두고 싶었어요.',
  9: '오늘 나눈 이야기를 기억하고 있어요.',
};
/**
 * 5화(아파서 쉬는 날) 세 후보가 각자 보내는 개인톡. 애착 유형이 연락 방식으로만 드러난다:
 * 카스테라는 먼저 챙기고, 도넛은 망설이다 짧게 보내고, 프레첼은 여러 번 보낸다.
 */
const CANDIDATE_CHECK_INS: Record<string, { lines: Line[]; events: Record<number, 'read' | 'typing' | 'deleted'> }> = {
  castella: {
    lines: [
      ['castella', '오늘 많이 힘들어 보였어요. 몸은 좀 괜찮아요?'],
      ['me', '쉬니까 조금 나아졌어요. 챙겨줘서 고마워요.'],
    ],
    events: { 0: 'read' },
  },
  donut: {
    lines: [
      ['donut', '혹시 많이 아파요? 계속 신경 쓰여서…'],
      ['donut', '괜찮아요?'],
    ],
    events: { 0: 'deleted', 1: 'typing' },
  },
  pretzel: {
    lines: [
      ['pretzel', '아프다고 들었어요. 괜찮아요?'],
      ['pretzel', '답장 없어서 걱정돼서 또 보내요. 자고 있는 거죠?'],
      ['me', '방금 일어났어요. 걱정해줘서 고마워요.'],
    ],
    events: { 1: 'typing' },
  },
};
function directMessenger(
  id: string,
  lines: Line[],
  events: Record<number, 'read' | 'typing' | 'deleted'>,
  roomId: string,
): SceneBlock | undefined {
  const direct = dialogue(id, 'pair', lines);
  if (direct.type !== 'pair') return undefined;
  return {
    ...direct,
    type: 'messenger',
    kind: 'direct',
    roomName: SCENE_CAST.find((person) => person.id === roomId)?.name ?? '개인 대화',
    events: Object.fromEntries(
      Object.entries(events).map(([index, event]) => [`${id}-${index}`, event]),
    ),
  };
}
export function buildEpisodeContent(
  order: number,
  state: SceneSeasonState,
  setting: SeasonSetting = 'school',
): EpisodeContent {
  if (!GROUP_LINES[order]) return { order, blocks: [] };
  const blocks: SceneBlock[] = [];
  blocks.push(dialogue(`ep${order}-group`, 'group', GROUP_LINES[order]));
  if (GROUP_ROOM_ORDERS.includes(order)) {
    const room = dialogue(`ep${order}-room`, 'group', [
      ['host', '단톡방 만들었어요! 다들 편하게 인사해요.'],
      ['castella', '우리 축제 때 뭐 준비해야 하지?'],
      ['me', '웅 아마도 이런 거 해야 할 것 같아.'],
      ['pretzel', '하고 싶은 말이 있는데 잠깐 생각하고 보낼게요.'],
    ]);
    if (room.type === 'group')
      blocks.push({
        ...room,
        type: 'messenger',
        kind: 'group',
        roomName: GROUP_ROOM_NAMES[setting],
        events: { [`ep${order}-room-1`]: 'read', [`ep${order}-room-3`]: 'deleted' },
      });
  }
  blocks.push({
    id: `ep${order}-transition`,
    type: 'transition',
    text: EPISODE_TRANSITIONS[setting][order] ?? '',
  });
  const priorPoint = order === 4 ? 1 : order === 6 ? 2 : order === 9 ? 4 : undefined;
  const prior = state.choices.find((choice) => choice.pointId === priorPoint);
  const conflictPartner =
    state.choices.find((choice) => choice.pointId === 3)?.breadId ?? 'castella';
  const partner =
    state.route === 'romance'
      ? (state.choices.find((choice) => choice.pointId === 3)?.breadId ?? 'castella')
      : 'friend';
  // 혼자 있기(breadId null)를 골랐으면 다음 회차 1:1 상대는 친구다(계약 v5 7장 — 4화·6화). 8화 혼자 있기는
  // 회차가 바로 끝나고 9화는 혼자 장면이다. 거절당했으면 지금처럼 혼자 장면.
  const target = prior
    ? prior.accepted && prior.breadId !== null
      ? prior.breadId
      : prior.breadId === null && priorPoint !== 4
        ? 'friend'
        : null
    : order >= 7
      ? partner
      : (FIRST_MEETINGS[order] ?? 'friend');
  if (prior && target === null) {
    blocks.push(
      dialogue(`ep${order}-alone`, 'pair', [
        [
          'me',
          order === 6
            ? '오늘은 누구에게도 연락하지 않고 조용히 쉬기로 했어.'
            : '조금 쉬면서 내 마음이 어디로 향하는지 생각해볼래.',
        ],
      ]),
    );
  } else if (order >= 7) {
    const script = state.route === 'romance' ? ROMANCE[order] : SOLO[order];
    blocks.push(
      dialogue(
        `ep${order}-${state.route ?? 'solo'}-pair`,
        'pair',
        script.map(([id, text]) => [
          id === 'partner' ? (target ?? partner) : id === 'conflict' ? conflictPartner : id,
          text,
        ]),
      ),
    );
  } else if (order === 6 && target === 'donut' && prior) {
    blocks.push(
      dialogue('ep6-short', 'pair', [
        ['donut', '축제 준비 고생했어요. 오늘은 먼저 들어가 볼게요.'],
        ['me', '알겠어요. 편히 쉬어요.'],
      ]),
    );
  } else {
    blocks.push(
      dialogue(
        `ep${order}-pair`,
        'pair',
        (PAIR_LINES[order] ?? []).map(([id, text]) => [id === 'partner' ? (target ?? 'friend') : id, text]),
      ),
    );
  }
  // 메신저가 없는 회차는 1:1 장면 뒤 바로 선택이나 회차 끝으로 넘어간다. 단톡방(messenger group)은
  // 어느 회차에도 두지 않는다(사용자 결정 — 1:1 뒤에 단톡방이 오면 안 된다).
  if (order === 5)
    CANDIDATE_IDS.forEach((id) => {
      const checkIn = CANDIDATE_CHECK_INS[id];
      const block = checkIn && directMessenger(`ep5-direct-${id}`, checkIn.lines, checkIn.events, id);
      if (block) blocks.push(block);
    });
  if (PARTNER_DIRECT_ORDERS.includes(order) && target && target !== 'friend') {
    const block = directMessenger(
      `ep${order}-direct`,
      [
        [target, DIRECT_OPENERS[order] ?? '오늘 나눈 이야기를 기억하고 있어요.'],
        ['me', order === 7 ? '알려줘서 고마워요. 서로 편한 시간에 이야기해요.' : '저도요. 다음에 또 이야기해요.'],
      ],
      { 0: 'read', 1: 'typing' },
      target,
    );
    if (block) blocks.push(block);
  }
  const choice = choiceFor(order, state);
  if (choice) {
    blocks.push({ id: `ep${order}-choice`, type: 'choice', choice });
    const recorded = state.choices.find((item) => item.pointId === choice.pointId);
    if (recorded) blocks.push(...choiceResultBlocks(recorded));
  }
  if (order === 10) {
    // 인터뷰: "이 시즌 (내 빵)은 당신에게 어떤 반죽이었나요?"에 출연진이 한 명씩 답한다(Figma 7884:4592).
    // 진행자(host)는 인터뷰하지 않는다. 시즌 중에 나를 거절한 빵은 그 일을 떠올리며 답한다.
    SCENE_CAST.filter((person) => !person.isMine && person.id !== 'host').forEach((person) => {
      const rejected = state.choices.some((item) => item.breadId === person.id && !item.accepted);
      const me = SCENE_CAST.find((cast) => cast.isMine);
      blocks.push({
        id: `interview-${person.id}`,
        type: 'interview',
        breadId: person.id,
        participants: me ? [me, person] : [person],
        messages: [
          {
            id: `interview-${person.id}-0`,
            participantId: person.id,
            side: 'left',
            text: rejected
              ? INTERVIEW_REJECTED_ANSWERS[person.id] ?? '마음이 엇갈렸지만 제 이야기를 끝까지 들어줬어요'
              : (INTERVIEW_ANSWERS[person.id] ?? '이번 시즌을 함께해줘서 고마운 반죽이었어요'),
          },
        ],
      });
    });
  }
  return { order, blocks: withoutGroupAfterPair(blocks) };
}

/**
 * 1:1 장면(pair) 뒤에 오는 단체 대화를 뺀다(사용자 결정 — 1화부터 10화까지 전부). 전체대화(group)와
 * 단톡방(messenger group) 둘 다다. 개인톡(messenger direct)·선택·인터뷰는 그대로 둔다.
 */
function withoutGroupAfterPair(blocks: SceneBlock[]): SceneBlock[] {
  const firstPair = blocks.findIndex((block) => block.type === 'pair');
  if (firstPair < 0) return blocks;
  return blocks.filter(
    (block, index) =>
      index < firstPair ||
      !(block.type === 'group' || (block.type === 'messenger' && block.kind === 'group')),
  );
}
