import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import CloudLargeIcon from "@/src/assets/icons/CloudLargeIcon";
import CloudMediumIcon from "@/src/assets/icons/CloudMediumIcon";
import BakingAsset from "@/src/assets/images/bread-baking/BakingAsset";
import BreadCharacter from "@/src/assets/images/BreadCharacter";
import PlayerAvatar from "@/src/assets/images/PlayerAvatar";
import BottomNav from "@/src/components/bottom-nav";
import Screen from "@/src/components/ui/screen";
import SectionHeader from "@/src/components/ui/section-header";
import Text from "@/src/components/ui/text";
import { okMallangBStyle } from "@/src/constants/typography";
import { sceneColors } from "@/src/features/luvin-hell/constants/scene-colors";
import { useTokenStore } from "@/src/features/luvin-hell/store/token-store";
import useTokenBalance from "@/src/features/tokens/hooks/use-token-balance";
import SeasonHistoryList from "@/src/features/oven/components/season-history-list";
import InfernoDevSeasonReset from "@/src/features/inferno/components/inferno-dev-season-reset";

/** 두 미리보기 카드 공용 우상단 하트 3개. 실제 게임 상태와 무관한 장식용이라 항상 꽉 차 있다. */
function PreviewHearts() {
  return (
    <View className="absolute right-[6px] top-[6px] flex-row gap-[1px]">
      <Text variant="body-xxs">❤️</Text>
      <Text variant="body-xxs">❤️</Text>
      <Text variant="body-xxs">❤️</Text>
    </View>
  );
}

interface DinoPreviewCardProps {
  /** 탭하면 게임 이름 라벨 오버레이를 보여준다 — 소금빵게임 카드와 동일한 반응, 네비게이션 없음. */
  showLabel: boolean;
}

/**
 * 공룡빵게임 미리보기 썸네일. 실제 `DinoRunnerScene` 은 라이브 엔진 props(phase/score/…)를
 * 받아 물리 루프를 돌리므로 이 작은 미리보기 용도로 마운트하지 않는다 — 같은 `sceneColors`
 * 토큰/`DinoRunnerScene`이 쓰는 구름·캐릭터·빵 컴포넌트로 정지 장면만 흉내낸 정적 근사치다
 * (디자인 QA: 첨부 목업과 배경/구름/캐릭터 포즈/장애물 배치/하트가 알아볼 수 있게 일치해야 함).
 */
function DinoPreviewCard({ showLabel }: DinoPreviewCardProps) {
  return (
    <View className="relative h-full w-full">
      <Svg
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <Defs>
          <LinearGradient id="ovenDinoPreviewSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={sceneColors.sky} />
            <Stop offset="1" stopColor={sceneColors.skyFade} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#ovenDinoPreviewSky)"
        />
      </Svg>

      <View className="absolute left-[6px] top-[16px]">
        <CloudLargeIcon width={36} height={23} />
      </View>
      <View className="absolute right-[8px] top-[26px]">
        <CloudMediumIcon width={28} height={18} />
      </View>
      <View className="absolute right-[22px] top-[38px]">
        <CloudMediumIcon width={22} height={14} />
      </View>

      <PreviewHearts />

      <View className="absolute bottom-0 left-0 right-0">
        <View
          className="h-[4px] w-full"
          style={{ backgroundColor: sceneColors.grassDark }}
        />
        <View
          className="relative h-[24px] w-full overflow-hidden"
          style={{ backgroundColor: sceneColors.ground }}
        >
          <View
            className="absolute"
            style={{
              left: 8,
              top: 6,
              width: 20,
              height: 5,
              backgroundColor: sceneColors.groundDark,
            }}
          />
          <View
            className="absolute"
            style={{
              left: 50,
              top: 13,
              width: 16,
              height: 5,
              backgroundColor: sceneColors.groundDark,
            }}
          />
          <View
            className="absolute"
            style={{
              left: 96,
              top: 7,
              width: 20,
              height: 5,
              backgroundColor: sceneColors.groundDark,
            }}
          />
        </View>
      </View>

      {/* 캐릭터(가로 중앙, 53~82px)와 겹치지 않도록 좌측 1개 + 우측 2개로 배치. */}
      <View className="absolute bottom-[24px] left-[6px] h-[16px] w-[16px]">
        <BreadCharacter type="donut" state="dough" className="h-full w-full" />
      </View>
      <View className="absolute bottom-[24px] left-[92px] h-[16px] w-[16px]">
        <BreadCharacter type="donut" state="dough" className="h-full w-full" />
      </View>
      <View className="absolute bottom-[24px] left-[114px] h-[16px] w-[16px]">
        <BreadCharacter type="donut" state="dough" className="h-full w-full" />
      </View>
      <PlayerAvatar
        facing="front"
        className="absolute bottom-[24px] left-1/2 h-[42px] w-[28px] -translate-x-1/2"
      />

      {showLabel ? (
        <View className="absolute inset-0 items-center justify-center bg-default-black/50">
          <Text variant="body-m" className="text-default-white">
            공룡빵게임
          </Text>
        </View>
      ) : null}
    </View>
  );
}

interface BreadBakingPreviewCardProps {
  /** 탭하면 게임 이름 라벨 오버레이를 보여준다 — 순수 시각 반응, 네비게이션 없음. */
  showLabel: boolean;
}

/** Figma 8026:4184 "03:00": Ok Mallang B 10px, leading 1.1. 이 자리에서만 쓰는 값이라 토큰으로 올리지 않았다(§8). */
const BAKING_PREVIEW_TIMER_STYLE = {
  ...okMallangBStyle,
  fontSize: 10,
  lineHeight: 11,
} as const;

/**
 * 다솜이의 소금빵게임(빵굽기) 미리보기 썸네일. Figma "Frame 522" (8026:4183) — pink-100 바탕에
 * 타이머, 재료 두 줄, 거품기, 반죽 그릇. 실제 게임 에셋(`BakingAsset`)을 시안 좌표에 그대로 놓는다.
 * 탭 시 이름 라벨 오버레이가 뜬다 — 공룡빵 카드와 동일한 반응.
 */
function BreadBakingPreviewCard({ showLabel }: BreadBakingPreviewCardProps) {
  return (
    <View className="relative h-full w-full bg-pink-100">
      <Text
        className="absolute right-[13px] top-[8px] text-pink-500"
        style={BAKING_PREVIEW_TIMER_STYLE}
      >
        03:00
      </Text>

      <View className="absolute left-[10px] top-[33px] flex-row items-center gap-[4px]">
        <View className="h-[23px] w-[22px]">
          <BakingAsset name="flour" />
        </View>
        <View className="h-[16px] w-[29px]">
          <BakingAsset name="eggs" />
        </View>
        <View className="h-[17px] w-[22px]">
          <BakingAsset name="butter" />
        </View>
        <View className="h-[24px] w-[21px]">
          <BakingAsset name="water" />
        </View>
      </View>
      <View className="absolute left-[40px] top-[60px] flex-row items-center gap-[4px]">
        <View className="h-[19px] w-[12px]">
          <BakingAsset name="salt" />
        </View>
        <View className="h-[19px] w-[12px]">
          <BakingAsset name="sugar" />
        </View>
        <View className="h-[19px] w-[13px]">
          <BakingAsset name="yeast" />
        </View>
      </View>
      <View className="absolute left-[77px] top-[70px] h-[41px] w-[30px]">
        <BakingAsset name="whisk" />
      </View>
      <View className="absolute left-[38px] top-[106px] h-[41px] w-[49px]">
        <BakingAsset name="doughBowl" />
      </View>

      {showLabel ? (
        <View className="absolute inset-0 items-center justify-center bg-default-black/50">
          <Text variant="body-m" className="text-center text-default-white">
            {"다솜이의\n소금빵가게"}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** 러빈지옥 에피소드 홈. Figma "에피소드 홈" (6263:5920), 하단탭 2번째(오븐) 아이콘 목적지. */
export default function OvenScreen() {
  const balance = useTokenStore((state) => state.balance);
  useTokenBalance();
  const [dinoPreviewLabelShown, setDinoPreviewLabelShown] = useState(false);
  const [bakingPreviewLabelShown, setBakingPreviewLabelShown] = useState(false);

  function handleMiniGameNavigate() {
    router.push("/luvin-hell");
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-col gap-[40px] px-[30px] pb-[24px] pt-[26px]"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full flex-row items-center justify-between">
          {/* Figma "Luvin's Inferno"(6263:5926): 24px, pink-500 위 pink-200 테두리 ~1px —
              감정일기 홈 "Luvin EmoDi"와 같은 값이라 `display.logo` 토큰으로 올렸다(§8). */}
          <Text variant="display-logo">Luvin’s Inferno</Text>
          {/* Figma 에서 이 줄만 변수 바인딩 없이 #000000 이라 default/black 토큰으로 맞췄다(bread.tsx와 동일 패턴). */}
          <Text variant="body-xs" className="text-default-black">
            나의 토큰: 🥐x{balance}
          </Text>
        </View>

        <View className="w-full flex-col items-start gap-[12px]">
          <SectionHeader title="러빈지옥 에피소드" />
          {/* 시즌마다 카드를 따로 둔다. 최신 시즌이 맨 위, 지난 시즌이 그 아래다. */}
          <SeasonHistoryList />
        </View>

        {/* 개발 빌드에서만 보인다(사용자 요청). 배포 빌드에서는 아무것도 그리지 않는다. */}
        <InfernoDevSeasonReset />

        <View className="w-full flex-col items-center gap-[16px]">
          <SectionHeader
            title="러빈지옥 토큰 벌기"
            actionLabel="미니게임 바로가기→"
            onActionPress={handleMiniGameNavigate}
          />
          <View className="w-full flex-col items-center gap-[8px] rounded-[8px] border border-default-gray p-[20px]">
            <View className="w-full flex-col items-start">
              <Text variant="body-s" className="text-text-primary">
                미니게임을 통해 토큰을 모아
              </Text>
              <Text variant="body-s" className="text-text-primary">
                나만의 러빈지옥을 계속 진행 할 수 있어요
              </Text>
            </View>
            <View className="flex-row items-center gap-[20px]">
              {/* 두 카드 모두 탭하면 이름 라벨 오버레이만 토글된다 — 네비게이션은 절대
                  일어나지 않는다(디자인 QA: 탭=시각 반응, 실제 진입은 위 "미니게임 바로가기"
                  링크로만 가능하다). */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="공룡빵게임 미리보기"
                className="h-[181px] w-[135px] overflow-hidden rounded-[12px] border-[3px] border-default-bg"
                onPress={() => setDinoPreviewLabelShown((shown) => !shown)}
              >
                <DinoPreviewCard showLabel={dinoPreviewLabelShown} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="다솜이의 소금빵가게 미리보기"
                className="h-[181px] w-[135px] overflow-hidden rounded-[12px] border-[3px] border-default-bg"
                onPress={() => setBakingPreviewLabelShown((shown) => !shown)}
              >
                <BreadBakingPreviewCard showLabel={bakingPreviewLabelShown} />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="pb-[10px]">
        <BottomNav active="oven" />
      </View>
    </Screen>
  );
}
