import { View } from 'react-native';

import CommentNavIcon from '@/src/assets/icons/CommentNavIcon';
import PlayerAvatar from '@/src/assets/images/PlayerAvatar';
import BreadCluster from '@/src/components/bread-cluster';
import JumpingBread from '@/src/components/jumping-bread';
import RiseIn from '@/src/components/ui/rise-in';
import { pink } from '@/src/constants/colors';
import HeartBeat from '@/src/features/welcome/components/heart-beat';
import type { TourIllustrationKind } from '@/src/features/welcome/constants/tour';

/**
 * 투어 장마다의 그림. 새 에셋 없이 앱에 이미 있는 반죽·아바타·아이콘을 엮어 만든다(시안 없음).
 * 모든 그림은 장이 펼쳐질 때 그려지므로(TourPage) 마운트 시점이 곧 등장 시점이다.
 */

/** 빵이 하나씩 튀어나오는 간격. */
const STAGGER_MS = 120;

/** 성향 테스트: 서로 다른 반죽 셋이 차례로 튀어나와 통통 뛴다. */
const DoughTrio = () => (
  <View className="flex-row items-end gap-[12px]">
    <JumpingBread type="salt" state="dough" className="h-[60px] w-[96px]" jumpDelayMs={0} jumpSpeed={1} jumping popInDelayMs={0} />
    <JumpingBread type="pretzel" state="dough" className="h-[60px] w-[96px]" jumpDelayMs={300} jumpSpeed={1.1} jumping popInDelayMs={STAGGER_MS} />
    <JumpingBread type="cream" state="dough" className="h-[60px] w-[96px]" jumpDelayMs={150} jumpSpeed={0.95} jumping popInDelayMs={STAGGER_MS * 2} />
  </View>
);

/** 러빈지옥: 내 분신과 상대 반죽 사이에서 하트가 두근거린다. */
const InfernoCouple = () => (
  <View className="flex-row items-center gap-[12px]">
    <JumpingBread type="salt" state="personDough" className="h-[80px] w-[130px]" jumpDelayMs={0} jumpSpeed={1} jumping popInDelayMs={0} />
    <HeartBeat size={32} delayMs={STAGGER_MS * 3} />
    <JumpingBread type="cream" state="personDough" className="h-[80px] w-[118px]" jumpDelayMs={500} jumpSpeed={1.05} jumping popInDelayMs={STAGGER_MS} />
  </View>
);

/** 미니게임: 플레이어 캐릭터 앞으로 장애물 반죽들이 통통 튄다(공룡빵게임). */
const MinigameRun = () => (
  <View className="flex-row items-end gap-[20px]">
    <RiseIn riseDistance={24}>
      <PlayerAvatar facing="front" className="h-[150px] w-[68px]" />
    </RiseIn>
    <JumpingBread type="baguette" state="dough" className="h-[48px] w-[78px]" jumpDelayMs={0} jumpSpeed={1.2} jumping popInDelayMs={STAGGER_MS * 2} />
    <JumpingBread type="donut" state="dough" className="h-[48px] w-[58px]" jumpDelayMs={400} jumpSpeed={1.1} jumping popInDelayMs={STAGGER_MS * 3} />
  </View>
);

interface ChattingDoughProps {
  type: 'donut' | 'madeleine' | 'castella';
  order: number;
}

/** 감정일기 친구 한 명: 말풍선을 띄운 반죽. */
const ChattingDough = ({ type, order }: ChattingDoughProps) => (
  <View className="items-center gap-[4px]">
    <RiseIn delayMs={STAGGER_MS * 3 + order * 250}>
      <CommentNavIcon color={pink[400]} size={28} />
    </RiseIn>
    <JumpingBread type={type} state="personDough" className="h-[66px] w-[90px]" jumpDelayMs={order * 350} jumpSpeed={1} jumping popInDelayMs={order * STAGGER_MS} />
  </View>
);

/** 감정일기: 친구 반죽 셋이 차례로 말풍선을 띄운다. */
const DiaryFriends = () => (
  <View className="flex-row items-end gap-[16px]">
    <ChattingDough type="donut" order={0} />
    <ChattingDough type="madeleine" order={1} />
    <ChattingDough type="castella" order={2} />
  </View>
);

interface TourIllustrationProps {
  kind: TourIllustrationKind | 'greeting';
}

export default function TourIllustration({ kind }: TourIllustrationProps) {
  switch (kind) {
    case 'greeting':
      return <BreadCluster state="baked" className="h-[169.2px] w-[236px]" popInDelayMs={0} jumping />;
    case 'dough':
      return <DoughTrio />;
    case 'inferno':
      return <InfernoCouple />;
    case 'minigame':
      return <MinigameRun />;
    case 'diary':
      return <DiaryFriends />;
    case 'finish':
      return <BreadCluster state="dough" className="h-[169.2px] w-[236px]" popInDelayMs={0} jumping />;
  }
}
