import type { ReactNode } from 'react';
import { View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import HeartIcon from '@/src/assets/icons/HeartIcon';
import Text from '@/src/components/ui/text';
import theme from '@/src/constants/theme';
import { okMallangBTitleStyle } from '@/src/constants/typography';
import InfernoBakeFade from '@/src/features/inferno/components/inferno-bake-fade';
import InfernoBakeGlow from '@/src/features/inferno/components/inferno-bake-glow';
import InfernoBakeSmoke from '@/src/features/inferno/components/inferno-bake-smoke';
import InfernoFinalMatchFigure from '@/src/features/inferno/components/inferno-final-match-figure';
import InfernoFinalMatchNames from '@/src/features/inferno/components/inferno-final-match-names';
import type { InfernoFinalMatchProfile } from '@/src/features/inferno/types';

const HEART_SIZE = 28;

/**
 * Figma ep5-결과(5748:4314) 쪽지 안 세로 배치. 제목은 쪽지 위에서 37, 반죽 줄은 93 에서 시작한다
 * (제목 줄 높이 22×1.6=35.2 를 빼면 제목 아래 20.8). 가운데 정렬이 아니라 위에서부터 놓는다 — 굽기 연출 중
 * 대기 문구가 이름으로 바뀌어 아래 글 높이가 달라져도 위의 반죽 줄이 움직이지 않는다.
 */
const TITLE_TOP_CLASS = 'h-[37px]';
const TITLE_GAP_CLASS = 'h-[20.8px]';

interface InfernoFinalMatchSceneProps {
  /** 맨 위 분홍 글자. ep5 는 "REPORT"(Figma 5748:4322), 다시 보기 투표 결과(ep1·ep3)는 "VOTE"/"RANDOM". */
  title?: string;
  /** 내 분신. 왼쪽에 선다. */
  mine: InfernoFinalMatchProfile;
  /** 상대 반죽. 오른쪽에 선다. 다시 보기에서 기록이 없으면 undefined. */
  partner?: InfernoFinalMatchProfile;
  /** 이름 아래 한 줄 요약. ep5 만 쓴다. */
  summaryLine?: string;
  /** 이름 옆 상대 성향(Figma "안정형"). ep5 만 쓰고, 서버가 아직 안 줘서 지금은 비어 있다(types 주석). */
  tendencyLabel?: string;
  /**
   * ep5 리포트를 기다리는 동안 이름 자리에 띄우는 문구. 상대가 아직 없을 때만 쓴다 — 넘기지 않으면
   * 상대가 없을 때 "기록된 투표가 없어요"(다시 보기)를 띄운다.
   */
  waitMessage?: string;
  /**
   * ep5 의 "반죽 → 빵" 굽기 연출 시계(InfernoFinalMatchReveal). 넘기면 반죽이 구운 빵으로 바뀌고, 연출이
   * 끝나면(시계가 끝 시각이면) 구운 빵 1페이지가 된다. 넘기지 않으면 반죽 그대로인 정지 화면이다.
   */
  reveal?: SharedValue<number>;
}

interface RevealLayerProps {
  reveal?: SharedValue<number>;
  kind?: 'reveal' | 'wait';
  children: ReactNode;
}

/** 연출 중에는 숨겼다가 빵이 된 뒤 나타나는 요소(제목·하트·이름). 연출이 없으면 그냥 그린다. */
function RevealLayer({ reveal, kind, children }: RevealLayerProps) {
  return reveal ? (
    <InfernoBakeFade time={reveal} kind={kind}>
      {children}
    </InfernoBakeFade>
  ) : (
    <>{children}</>
  );
}

/**
 * ep5 1페이지 — 최종 매칭 상대 공개.
 *
 * 처음엔 Figma 디자인이 없어 다른 회차 쪽지의 타이틀 규칙(REPORT/HIGHLIGHT 와 같은 Ok
 * Mallang B 핑크 타이틀)을 빌려 "RESULT" 로 썼다. 내 반죽 → 하트 → 매칭 상대 반죽을
 * 가로로 나란히 잇는 "매칭 성사" 장면 — `InfernoPersonalChatSidebar`가 1:1 대화에서 둘을
 * personDough(팔다리 있는 반죽)로 나란히 세우는 것과 같은 이유로 personDough 로 고정했었다.
 * 지금은 디자인에 맞췄다(아래 Figma 문단).
 *
 * 다음 페이지 이동은 상단 바 "다음화면"(InfernoTopBar)이 이미 있어 페이지 안에 따로
 * 버튼을 두지 않는다.
 *
 * ep1·ep3 을 다시 볼 때 투표지 대신 같은 장면을 "VOTE" 제목으로 쓴다(사용자 요청) — 내 반죽과
 * 내가 투표한 반죽(ep3 미니게임 실패면 랜덤으로 정해진 반죽)을 나란히 세운다.
 *
 * ep5 는 `reveal` 로 굽기 연출을 이 자리에서 그대로 튼다(사용자 지시): 리포트를 기다리는 동안 내 반죽이
 * 연기 속에서 구워지고, 리포트가 오면 연기 뒤에서 상대와 함께 구운 빵이 되어(러빈지옥 동안은 반죽, 끝날
 * 때는 빵) 제목·하트·이름이 나타난다. 연출이 따로 떨어진 화면이 아니라 1페이지의 같은 칸에서 일어나서,
 * 넘어갈 때 빵 크기·위치가 튀지 않는다.
 *
 * Figma ep5-결과(5748:4314)가 나와서 배치를 맞췄다 — 제목 "REPORT", 위에서부터 놓는 세로 배치
 * (TITLE_TOP_CLASS 주석), 반죽·하트 사이 20, 줄과 글 사이 28, 글은 Body/S. 시안의 두 캐릭터는 팔다리
 * 반죽이지만, 굽기 연출이 구운 빵으로 끝나니 1페이지도 구운 빵으로 둔다(사용자 결정, 2026-10-20).
 * VOTE/RANDOM 다시 보기도 같은 장면이라 배치를 같이 따른다(그림은 그대로 personDough).
 */
export default function InfernoFinalMatchScene({
  title = 'REPORT',
  mine,
  partner,
  summaryLine,
  tendencyLabel,
  waitMessage,
  reveal,
}: InfernoFinalMatchSceneProps) {
  const isWaiting = !partner && waitMessage !== undefined;

  return (
    <View className="flex-1 flex-col items-center">
      <View className={TITLE_TOP_CLASS} />
      <RevealLayer reveal={reveal}>
        <Text className="text-center text-pink-500" style={okMallangBTitleStyle}>
          {title}
        </Text>
      </RevealLayer>
      <View className={TITLE_GAP_CLASS} />

      <View className="flex-col items-center gap-[28px]">
        <View className="flex-row items-center gap-[20px]">
          {reveal ? <InfernoBakeGlow time={reveal} /> : null}
          <InfernoFinalMatchFigure profile={mine} side={-1} reveal={reveal} />
          {partner ? (
            <>
              <RevealLayer reveal={reveal}>
                <HeartIcon color={theme.heart.filled} size={HEART_SIZE} />
              </RevealLayer>
              <InfernoFinalMatchFigure profile={partner} side={1} reveal={reveal} />
            </>
          ) : null}
          {reveal ? <InfernoBakeSmoke time={reveal} /> : null}
        </View>

        {isWaiting ? (
          <RevealLayer reveal={reveal} kind="wait">
            <Text variant="body-s" className="text-center text-inferno-instruction">
              {waitMessage}
            </Text>
          </RevealLayer>
        ) : (
          <RevealLayer reveal={reveal}>
            <InfernoFinalMatchNames partner={partner} summaryLine={summaryLine} tendencyLabel={tendencyLabel} />
          </RevealLayer>
        )}
      </View>
    </View>
  );
}
