import type { ReactNode } from 'react';
import { View } from 'react-native';

import RiseIn from '@/src/components/ui/rise-in';
import Text from '@/src/components/ui/text';

/** 그림이 들어가는 칸의 높이. 장마다 그림 크기가 달라도 글 위치가 같아야 넘길 때 덜컹이지 않는다. */
const ILLUSTRATION_AREA_CLASS = 'h-[200px] w-full items-center justify-center';

/**
 * 설명은 가장 긴 장(러빈지옥)이 세 줄이다. 세 줄 높이(body-s 22.4 x 3)를 늘 잡아 둬야 두 줄짜리
 * 장과 제목 높이가 같아져서 넘길 때 제목이 위아래로 흔들리지 않는다.
 */
const DESCRIPTION_AREA_CLASS = 'min-h-[68px]';

/** 그림이 튀어나온 뒤 제목·설명이 떠오르는 시간. */
const TITLE_DELAY_MS = 350;
const DESCRIPTION_DELAY_MS = 550;

interface TourPageProps {
  /** 한 번이라도 펼쳐진 장만 그린다 — 펼쳐지는 순간 등장 애니메이션이 시작되게(use-welcome-tour). */
  visited: boolean;
  illustration: ReactNode;
  /** 문자열이면 기본 제목 모양으로 떠오르고, 노드면 그대로 쓴다(인사 장의 통통 튀는 제목). */
  title: ReactNode;
  description: string;
}

/**
 * 환영 투어 한 장. 화면 폭을 꽉 채워 가로 스크롤의 한 칸이 된다.
 * 위에서부터 그림 → 제목 → 설명 순서로, 모두 가운데 정렬이다.
 */
export default function TourPage({ visited, illustration, title, description }: TourPageProps) {
  return (
    <View className="w-screen flex-1 items-center justify-center px-[30px]">
      {visited ? (
        <View className="w-full items-center gap-[40px]">
          <View className={ILLUSTRATION_AREA_CLASS}>{illustration}</View>

          <View className="w-full items-center gap-[8px]">
            {typeof title === 'string' ? (
              <RiseIn delayMs={TITLE_DELAY_MS}>
                <Text variant="heading-h2" className="text-center text-default-black">
                  {title}
                </Text>
              </RiseIn>
            ) : (
              title
            )}
            <RiseIn delayMs={DESCRIPTION_DELAY_MS} className={DESCRIPTION_AREA_CLASS}>
              <Text variant="body-s" className="text-center text-default-black">
                {description}
              </Text>
            </RiseIn>
          </View>
        </View>
      ) : null}
    </View>
  );
}
