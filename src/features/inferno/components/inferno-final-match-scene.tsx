import { View } from 'react-native';

import HeartIcon from '@/src/assets/icons/HeartIcon';
import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import theme from '@/src/constants/theme';
import { okMallangBTitleStyle } from '@/src/constants/typography';
import { findDoughFigure } from '@/src/features/inferno/constants/dough-figures';
import type { InfernoFinalMatchProfile } from '@/src/features/inferno/types';

const HEART_SIZE = 28;

/** 다시 보기에서 고른 반죽 기록이 없을 때(기록을 남기기 전에 한 투표) 보여주는 문구. */
const NO_PARTNER_MESSAGE = '기록된 투표가 없어요';

interface InfernoFinalMatchSceneProps {
  /** 맨 위 분홍 글자. ep5 는 "RESULT", 다시 보기 투표 결과(ep1·ep3)는 "VOTE". */
  title?: string;
  /** 내 분신. 왼쪽에 선다. */
  mine: InfernoFinalMatchProfile;
  /** 상대 반죽. 오른쪽에 선다. 다시 보기에서 기록이 없으면 undefined. */
  partner?: InfernoFinalMatchProfile;
  /** 이름 아래 한 줄 요약. ep5 만 쓴다. */
  summaryLine?: string;
}

/**
 * [DRAFT] ep5 1페이지 — 최종 매칭 상대 공개.
 *
 * Figma 디자인이 아직 없어 다른 회차 쪽지의 타이틀 규칙(REPORT/HIGHLIGHT 와 같은 Ok
 * Mallang B 핑크 타이틀)을 빌려 "RESULT" 로 썼다. 내 반죽 → 하트 → 매칭 상대 반죽을
 * 가로로 나란히 잇는 "매칭 성사" 장면 — `InfernoPersonalChatSidebar`가 1:1 대화에서 둘을
 * personDough(팔다리 있는 반죽)로 나란히 세우는 것과 같은 이유로, 여기서도 항상
 * personDough 로 고정한다. 디자인이 나오면 다시 손볼 예정.
 *
 * 다음 페이지 이동은 상단 바 "다음화면"(InfernoTopBar)이 이미 있어 페이지 안에 따로
 * 버튼을 두지 않는다.
 *
 * ep1·ep3 을 다시 볼 때 투표지 대신 같은 장면을 "VOTE" 제목으로 쓴다(사용자 요청) — 내 반죽과
 * 내가 투표한 반죽(ep3 미니게임 실패면 랜덤으로 정해진 반죽)을 나란히 세운다.
 */
export default function InfernoFinalMatchScene({
  title = 'RESULT',
  mine,
  partner,
  summaryLine,
}: InfernoFinalMatchSceneProps) {
  return (
    <View className="flex-1 flex-col items-center justify-center gap-[16px]">
      <Text className="text-center text-pink-500" style={okMallangBTitleStyle}>
        {title}
      </Text>

      <View className="flex-row items-center gap-[16px]">
        <BreadCharacter
          type={mine.type}
          state="personDough"
          className={findDoughFigure(mine.type).chatSizeClass}
          accessibilityLabel={mine.name}
        />
        {partner ? (
          <>
            <HeartIcon color={theme.heart.filled} size={HEART_SIZE} />
            <BreadCharacter
              type={partner.type}
              state="personDough"
              className={findDoughFigure(partner.type).chatSizeClass}
              accessibilityLabel={partner.name}
            />
          </>
        ) : null}
      </View>

      <View className="flex-col items-center gap-[4px]">
        <Text variant="heading-h4" className="text-text-primary">
          {partner ? partner.name : NO_PARTNER_MESSAGE}
        </Text>
        {summaryLine ? (
          <Text variant="body-m" className="text-center text-text-primary">
            {summaryLine}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
