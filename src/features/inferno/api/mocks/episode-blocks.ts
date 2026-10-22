/** [DRAFT] Ten episodes. Shared events have separate romance/solo dialogue scripts. */
import { getInfernoConversation } from '@/src/features/inferno/api/conversation';
import { CANDIDATE_IDS, PERSONAS, SCENE_CAST } from '@/src/features/inferno/api/mocks/scene-cast';
import type { InfernoChatMessage } from '@/src/features/inferno/types';
import type {
  ChoiceBlock,
  ChoicePoint,
  ChoiceRecord,
  EpisodeContent,
  SceneBlock,
  SceneSeasonState,
} from '@/src/features/inferno/types/scene-block';

type Line = [string, string];
export function dialogue(
  id: string,
  type: 'pair' | 'group' | 'interview',
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
const GROUP_LINES: Record<number, Line[]> = {
  1: [
    ['host', '어서 와요! 같은 오븐에서 서로의 속도를 알아가 봐요.'],
    ['me', '말보다 행동으로 마음을 보여주는 편이에요.'],
    ['castella', '천천히 알아가도 괜찮아요.'],
  ],
  2: [
    ['host', '우리 단톡방을 만들었어요. 부담 없이 소식을 나눠요.'],
    ['pretzel', '답장이 늦으면 조금 걱정될 것 같아요.'],
    ['castella', '각자 편한 시간에 답해도 괜찮다고 정해요.'],
  ],
  3: [
    ['host', '준비한 찻잔을 함께 정리해 볼까요?'],
    ['donut', '둘이 남으니 조금 조용하네요.'],
    ['me', '그래서 더 솔직하게 말할 수 있을 것 같아요.'],
  ],
  4: [
    ['host', '이번에는 다 같이 빵 축제를 준비해요!'],
    ['castella', '역할은 하고 싶은 걸로 골라요.'],
    ['pretzel', '같이 장식 준비할 사람 있나요?'],
  ],
  5: [
    ['castella', '어제 힘들어 보였는데 오늘은 괜찮아요?'],
    ['donut', '생각은 했는데 연락할 타이밍을 놓쳤어요.'],
    ['pretzel', '연락을 여러 번 했네요. 답을 재촉한 것 같아 미안해요.'],
  ],
  6: [
    ['host', '드디어 축제 날이에요. 모두 고생했어요!'],
    ['me', '마음을 전하는 것도 내 속도로 해보려고요.'],
    ['friend', '어떤 답을 들어도 네 마음을 소중하게 여겨줘.'],
  ],
  7: [
    ['host', '축제가 끝나니 다들 다시 바빠졌네요.'],
    ['me', '연락이 줄어드니 거리가 느껴져요.'],
    ['friend', '상대의 사정을 짐작하기보다 물어보는 건 어때?'],
  ],
  8: [
    ['host', '약속한 준비가 엇갈렸어요. 서로 무슨 일이 있었나요?'],
    ['me', '기다리는 동안 내 마음이 중요하지 않은 것 같았어요.'],
    ['friend', '누가 잘못했는지보다 무엇이 필요했는지 말해보자.'],
  ],
  9: [
    ['host', '다시 이야기할 자리를 준비했어요. 원하지 않으면 쉬어도 돼요.'],
    ['me', '서로 편한 방식으로 이야기하고 싶어요.'],
    ['castella', '다른 마음이어도 존중할 수 있어요.'],
  ],
  10: [
    ['host', '같은 오븐에서 보낸 시간이 마무리되네요.'],
    ['me', '서로 다른 속도를 알아가는 시간이었어요.'],
    ['friend', '누군가를 고르는 것만큼 나를 돌보는 것도 배웠지.'],
  ],
};
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
    ['friend', '좋아. 참석이 어려워도 부담 없이 말하기로 하자.'],
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
function choiceFor(order: number, state: SceneSeasonState): ChoiceBlock | undefined {
  const spec = QUESTIONS[order];
  if (!spec) return undefined;
  const conflict = state.choices.find((choice) => choice.pointId === 3)?.breadId ?? 'castella';
  const ids = order === 8 ? [conflict, 'friend'] : CANDIDATE_IDS;
  return {
    pointId: spec[0],
    question: spec[1],
    candidates: ids.map((breadId, index) => ({
      breadId,
      memory:
        order === 8
          ? breadId === 'friend'
            ? '내 고민을 들어준 친구'
            : '약속이 엇갈려 마음을 나눠야 하는 상대'
          : (MEMORIES[order]?.[index] ?? ''),
    })),
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
export function buildEpisodeContent(order: number, state: SceneSeasonState): EpisodeContent {
  if (!GROUP_LINES[order]) return { order, blocks: [] };
  const blocks: SceneBlock[] = [];
  // Existing ep1/2/3/4 lines are reused at the new narrative positions, without old game/vote prompts.
  const oldOrder = ({ 1: 1, 2: 2, 3: 3, 6: 4 } as Record<number, number>)[order];
  const old = oldOrder ? getInfernoConversation(oldOrder) : undefined;
  blocks.push(dialogue(`ep${order}-group`, 'group', GROUP_LINES[order]));
  if (old)
    old.pages.forEach((page, index) =>
      blocks.push({
        id: `ep${order}-legacy-${index}`,
        type: 'group',
        participants: old.participants,
        messages: page.messages,
      }),
    );
  blocks.push({
    id: `ep${order}-transition`,
    type: 'transition',
    text: order === 6 ? '축제가 끝난 뒤' : '그날 저녁',
  });
  const priorPoint = order === 4 ? 1 : order === 6 ? 2 : order === 9 ? 4 : undefined;
  const prior = state.choices.find((choice) => choice.pointId === priorPoint);
  const conflictPartner =
    state.choices.find((choice) => choice.pointId === 3)?.breadId ?? 'castella';
  const partner =
    state.route === 'romance'
      ? (state.choices.find((choice) => choice.pointId === 3)?.breadId ?? 'castella')
      : 'friend';
  const target = prior ? (prior.accepted ? prior.breadId : null) : order >= 7 ? partner : 'donut';
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
  } else if (old?.personalChatPages && (!prior || (order === 6 && target !== null))) {
    old.personalChatPages.forEach((page, index) =>
      blocks.push({
        id: `ep${order}-pair-${index}`,
        type: 'pair',
        participants: SCENE_CAST,
        messages: page.messages.map((message) =>
          order === 6 && message.participantId === 'donut'
            ? { ...message, participantId: target ?? 'donut' }
            : message,
        ),
      }),
    );
  } else {
    blocks.push(
      dialogue(`ep${order}-pair`, 'pair', [
        [
          'me',
          order === 4
            ? '같이 준비하게 돼서 반가워요. 어떤 역할이 편해요?'
            : '오늘 함께한 시간은 어땠어요?',
        ],
        [
          target ?? 'friend',
          order === 4
            ? '천천히 의견을 나누면서 준비해요.'
            : '우리 조금 잘 맞는 것 같아요. 서로의 속도를 알아가고 싶어요.',
        ],
      ]),
    );
  }
  const messenger = dialogue(`ep${order}-messages`, 'group', [
    ['host', order === 10 ? '마지막 인사를 남겨주세요.' : '오늘도 함께해줘서 고마워요.'],
    [
      'me',
      order === 8
        ? '서운했던 일은 차분히 이야기해보고 싶어요.'
        : '오늘의 마음을 조금 더 알게 됐어요.',
    ],
    [
      'pretzel',
      order === 9
        ? '답장을 기다릴 때 내 마음도 말해볼게요.'
        : '하고 싶은 말이 있는데 잠깐 생각하고 보낼게요.',
    ],
  ]);
  if (messenger.type === 'group')
    blocks.push({
      ...messenger,
      type: 'messenger',
      roomName: '같은 오븐의 우리',
      kind: 'group',
      events: { [`ep${order}-messages-0`]: 'read', [`ep${order}-messages-2`]: 'deleted' },
    });
  if ([4, 6, 7, 9].includes(order) && target && target !== 'friend') {
    const direct = dialogue(`ep${order}-direct`, 'pair', [
      [
        target,
        order === 7
          ? '오늘은 늦게 답하게 될 것 같아요. 미리 알려두고 싶었어요.'
          : '오늘 나눈 이야기를 기억하고 있어요.',
      ],
      ['me', '알려줘서 고마워요. 서로 편한 시간에 이야기해요.'],
    ]);
    if (direct.type === 'pair')
      blocks.push({
        ...direct,
        type: 'messenger',
        kind: 'direct',
        roomName: SCENE_CAST.find((person) => person.id === target)?.name ?? '개인 대화',
        events: { [`ep${order}-direct-0`]: 'read', [`ep${order}-direct-1`]: 'typing' },
      });
  }
  const choice = choiceFor(order, state);
  if (choice) {
    blocks.push({ id: `ep${order}-choice`, type: 'choice', choice });
    const recorded = state.choices.find((item) => item.pointId === choice.pointId);
    if (recorded) blocks.push(...choiceResultBlocks(recorded));
  }
  if (order === 10) {
    SCENE_CAST.filter((person) => !person.isMine).forEach((person) => {
      const rejection = state.choices.find((item) => item.breadId === person.id && !item.accepted);
      blocks.push(
        dialogue(`interview-${person.id}`, 'interview', [
          [
            person.id,
            rejection?.reason ??
              (person.id === 'friend'
                ? '자기 마음을 돌보는 방법을 배운 친구예요.'
                : '자기 속도를 말하고 내 이야기도 들어주던 빵으로 기억할게요.'),
          ],
        ]),
      );
    });
  }
  if (order === 9) {
    const opening = blocks.findIndex((block) => block.type === 'pair');
    if (opening >= 0) blocks.unshift(...blocks.splice(opening, 1));
  }
  return { order, blocks };
}
