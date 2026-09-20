import type { ReactNode } from 'react';
import { View } from 'react-native';

import type { InfernoChatSide } from '@/src/features/inferno/types';

interface InfernoChatBubbleProps {
  side: InfernoChatSide;
  /** 내 분신의 말이면 진한 노랑, 아니면 연한 노랑. Figma 5425:901 / 5449:1546. */
  isMine: boolean;
  children: ReactNode;
}

/**
 * 러빈지옥 대화 말풍선. Figma `firstmeeting` (5425:901).
 *
 * 꼬리 대신 반죽 쪽 아래 모서리만 각지게 두는 시안이라, 각지는 모서리는 좌우 위치를 따라간다.
 * 글자에 맞춰 늘어나는(hug) 상자라서 한 글자씩 쳐지면 반죽 쪽에 붙은 채로 자란다.
 */
export default function InfernoChatBubble({ side, isMine, children }: InfernoChatBubbleProps) {
  const cornerClass = side === 'right' ? 'rounded-br-none' : 'rounded-bl-none';
  const colorClass = isMine ? 'bg-yellow-400' : 'bg-yellow-200';

  return (
    <View className={`shrink rounded-[20px] px-[20px] py-[10px] ${cornerClass} ${colorClass}`}>
      {children}
    </View>
  );
}
