import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import CloudLargeIcon from "@/src/assets/icons/CloudLargeIcon";
import CloudMediumIcon from "@/src/assets/icons/CloudMediumIcon";
import BreadCharacter from "@/src/assets/images/BreadCharacter";
import PlayerAvatar from "@/src/assets/images/PlayerAvatar";
import BottomNav from "@/src/components/bottom-nav";
import OkMallangBText from "@/src/components/ui/ok-mallang-b-text";
import Screen from "@/src/components/ui/screen";
import SectionHeader from "@/src/components/ui/section-header";
import Text from "@/src/components/ui/text";
import { pink } from "@/src/constants/colors";
import EpisodeThumbnailCard from "@/src/features/home/components/episode-thumbnail-card";
import type { WeeklyEpisode } from "@/src/features/home/types";
import { sceneColors } from "@/src/features/luvin-hell/constants/scene-colors";
import { LANE_ROTATION_DEG } from "@/src/features/luvin-hell/games/bread-crossing/engine/constants";
import { useTokenStore } from "@/src/features/luvin-hell/store/token-store";
import EpisodeHistoryRow from "@/src/features/oven/components/episode-history-row";

// API 연동 전. 시안(6263:5920)의 값을 그대로 넣어 뒀다.
const CURRENT_EPISODE: WeeklyEpisode = {
  order: 3,
  title: "미니게임으로 사랑을 쟁취하세요!",
};

const PAST_EPISODES = [
  { label: "Episode 02", body: "우리 조금 잘 맞는 것 같아요" },
  { label: "Episode 01", body: "안녕하세요 소금빵입니다!" },
];

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
  /** 탭하면 게임 이름 라벨 오버레이를 보여준다 — 빵건너친구들 카드와 동일한 반응, 네비게이션 없음. */
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

const BREAD_ROTATION_STYLE = {
  transform: [{ rotate: `${LANE_ROTATION_DEG}deg` }],
} as const;

const PREVIEW_CARD_WIDTH = 135;
const PREVIEW_CARD_HEIGHT = 181;
const PREVIEW_ROTATION_RAD = (LANE_ROTATION_DEG * Math.PI) / 180;
/**
 * 레인 배경 전체를 하나로 묶어 통째로 회전시킨다(개별 줄마다 따로 회전시키면 각 줄 안에서만
 * 각도가 상쇄돼 사선이 거의 안 보이는 문제가 있었음 — 디자인 QA 재확인). 회전 후에도 카드
 * 네 모서리를 다 덮도록 실제 게임(`LaneSlotView`)과 같은 방식으로 회전 전 크기를 역산한다.
 */
const PREVIEW_BG_WIDTH =
  PREVIEW_CARD_WIDTH * Math.cos(PREVIEW_ROTATION_RAD) +
  PREVIEW_CARD_HEIGHT * Math.sin(PREVIEW_ROTATION_RAD) +
  20;
const PREVIEW_BG_HEIGHT =
  PREVIEW_CARD_WIDTH * Math.sin(PREVIEW_ROTATION_RAD) +
  PREVIEW_CARD_HEIGHT * Math.cos(PREVIEW_ROTATION_RAD) +
  20;

/** 기찻길/강 힌트(얇음) - 초원 - 도로(굵음) - 초원 4줄을 이 비율로 나눠 하나의 배경에 담는다. */
const PREVIEW_LANE_FLEX = [1, 1, 4, 1] as const;

function PreviewLaneBackground() {
  return (
    <View
      className="absolute flex-col overflow-hidden"
      style={[
        {
          left: (PREVIEW_CARD_WIDTH - PREVIEW_BG_WIDTH) / 2,
          top: (PREVIEW_CARD_HEIGHT - PREVIEW_BG_HEIGHT) / 2,
          width: PREVIEW_BG_WIDTH,
          height: PREVIEW_BG_HEIGHT,
        },
        BREAD_ROTATION_STYLE,
      ]}
    >
      <View
        className="w-full"
        style={{
          flex: PREVIEW_LANE_FLEX[0],
          backgroundColor: sceneColors.trackAccent,
        }}
      />
      <View
        className="w-full"
        style={{
          flex: PREVIEW_LANE_FLEX[1],
          backgroundColor: sceneColors.grass,
        }}
      />
      <View
        className="w-full"
        style={{
          flex: PREVIEW_LANE_FLEX[2],
          backgroundColor: sceneColors.trackBase,
        }}
      />
      <View
        className="w-full"
        style={{
          flex: PREVIEW_LANE_FLEX[3],
          backgroundColor: sceneColors.grass,
        }}
      />
    </View>
  );
}

interface BreadCrossingPreviewCardProps {
  /** 탭하면 게임 이름 라벨 오버레이를 보여준다 — 순수 시각 반응, 네비게이션 없음. */
  showLabel: boolean;
}

/**
 * 빵건너친구들 미리보기 썸네일. 마찬가지로 실제 `BreadCrossingScene`(라이브 엔진)을 마운트하지
 * 않고, 같은 대각선 레인 회전 기법(`LANE_ROTATION_DEG`)과 색 토큰으로 정지 장면을 흉내낸다.
 * 탭 시 `rgba(29,29,29,0.5)` 오버레이 + 흰 텍스트가 뜬다 — 공룡빵 카드와 동일한 반응(§디자인 QA).
 */
function BreadCrossingPreviewCard({
  showLabel,
}: BreadCrossingPreviewCardProps) {
  return (
    <View className="relative h-full w-full overflow-hidden">
      <PreviewLaneBackground />

      {/* 상단 다리(널빤지) 힌트 — Figma에서 강/기찻길 위를 가로지르는 나무 판. */}
      <View
        className="absolute left-[64px] top-[-2px] h-[10px] w-[64px] rounded-[3px]"
        style={[
          { backgroundColor: sceneColors.woodAccent },
          BREAD_ROTATION_STYLE,
        ]}
      />

      <PreviewHearts />

      <View className="absolute left-[10px] top-[46px] h-[18px] w-[18px]">
        <BreadCharacter
          type="pretzel"
          state="dough"
          className="h-full w-full"
        />
      </View>
      <View className="absolute right-[14px] top-[58px] h-[18px] w-[18px]">
        <BreadCharacter
          type="castella"
          state="dough"
          className="h-full w-full"
        />
      </View>
      <View className="absolute left-[16px] top-[92px] h-[18px] w-[18px]">
        <BreadCharacter type="donut" state="dough" className="h-full w-full" />
      </View>
      <View className="absolute right-[12px] top-[104px] h-[18px] w-[18px]">
        <BreadCharacter type="donut" state="dough" className="h-full w-full" />
      </View>

      <PlayerAvatar
        facing="back"
        className="absolute left-1/2 top-[64px] h-[42px] w-[28px] -translate-x-1/2"
      />

      {showLabel ? (
        <View className="absolute inset-0 items-center justify-center bg-default-black/50">
          <Text variant="body-m" className="text-default-white">
            빵건너친구들
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** 러빈지옥 에피소드 홈. Figma "에피소드 홈" (6263:5920), 하단탭 2번째(오븐) 아이콘 목적지. */
export default function OvenScreen() {
  const balance = useTokenStore((state) => state.balance);
  const [dinoPreviewLabelShown, setDinoPreviewLabelShown] = useState(false);
  const [breadPreviewLabelShown, setBreadPreviewLabelShown] = useState(false);

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
              이 화면에만 쓰이는 1회성 크기/테두리라 typography.ts에 토큰화하지 않았다(§8 예외). */}
          <OkMallangBText
            fontSize={24}
            lineHeight={24 * 1.1}
            fill={pink[500]}
            stroke={pink[200]}
            strokeWidth={1}
          >
            Luvin’s Inferno
          </OkMallangBText>
          {/* Figma 에서 이 줄만 변수 바인딩 없이 #000000 이라 default/black 토큰으로 맞췄다(bread.tsx와 동일 패턴). */}
          <Text variant="body-xs" className="text-default-black">
            나의 토큰: 🥐x{balance}
          </Text>
        </View>

        <View className="w-full flex-col items-start gap-[12px]">
          <SectionHeader title="러빈지옥 에피소드" />
          <EpisodeThumbnailCard episode={CURRENT_EPISODE} />
          {PAST_EPISODES.map((episode) => (
            <EpisodeHistoryRow
              key={episode.label}
              label={episode.label}
              body={episode.body}
            />
          ))}
        </View>

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
                accessibilityLabel="빵건너친구들 미리보기"
                className="h-[181px] w-[135px] overflow-hidden rounded-[12px] border-[3px] border-default-bg"
                onPress={() => setBreadPreviewLabelShown((shown) => !shown)}
              >
                <BreadCrossingPreviewCard showLabel={breadPreviewLabelShown} />
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
