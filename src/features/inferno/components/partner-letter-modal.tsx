import { usePathname } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, useWindowDimensions, View } from 'react-native';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import InfernoDotBackground from '@/src/features/inferno/components/inferno-dot-background';
import PartnerLetterArrival from '@/src/features/inferno/components/partner-letter-arrival';
import PartnerLetterPaper from '@/src/features/inferno/components/partner-letter-paper';
import usePartnerLetter from '@/src/features/inferno/hooks/use-partner-letter';
import { isLandscapeRoute } from '@/src/hooks/use-landscape-routes';

/**
 * [DRAFT] 회차 쪽지. 회차를 완료할 때마다 서버가 한 통씩 만들고, 안 읽은 쪽지가 있으면 어느 화면이든
 * 맨 먼저 뜬다(use-partner-letter — `GET .../letters/unread`). 10화 쪽지가 시즌 종료 쪽지다. Figma 시안이
 * 없어 사용자 설명대로 러빈지옥 쪽지 모달(InfernoNoteModal)과 같은 두 겹 — 바깥 물방울 무늬(반경 12),
 * 안쪽 흰 쪽지(반경 8) — 으로 짰다.
 *
 * 도착 안내 → 펼친 쪽지를 모달 두 개가 아니라 한 모달 안에서 바꿔 보여준다. iOS 는 모달을 겹쳐
 * 띄우면 뒤의 것이 안 뜨거나 닫히지 않는 문제가 있어서다.
 *
 * 쪽지를 읽기 전에는 바깥을 눌러도, 안드로이드 뒤로가기를 해도 닫히지 않는다 — 어느 화면으로 열리든
 * 쪽지부터 봐야 한다(사용자 결정). 펼친 쪽지는 닫기 버튼 없이 **바깥 빈 곳을 누르면** 닫히고 읽은 것으로
 * 친다(사용자 지정, `POST .../letters/{id}/read`). 받지 못했을 때는 "나중에 보기"로 이번만 내린다.
 *
 * 루트 레이아웃에 놓여 어느 화면 위에든 뜬다. 단 러빈지옥(가로) 화면에서는 띄우지 않고, 회차를 나와 화면이
 * 세로로 다 돈 뒤에 띄운다(사용자 지적 — 가로에서부터 나왔다). 회전 중에 뜬 모달은 iOS 에서 보이지 않는 막으로
 * 남아 다음 화면의 탭을 막을 수도 있다. 혹시 몰라 두 방향은 그대로 허용한다(InfernoNoteModal 주석 참고).
 */
export default function PartnerLetterModal() {
  const { query, letter, read } = usePartnerLetter();
  /** 펼친 쪽지 id. 쪽지가 바뀌면 자연히 "도착 안내"부터 다시 보인다. */
  const [openedLetterId, setOpenedLetterId] = useState<number | null>(null);
  /**
   * "나중에 보기"로 내렸거나 방금 읽어서 닫은 쪽지. 읽음 요청·다시 받기를 기다리지 않고 바로 숨긴다 — 기다리면
   * 닫은 뒤에도 잠깐 "쪽지 열기"가 다시 보였다(사용자 지적).
   */
  const [hiddenLetterIds, setHiddenLetterIds] = useState<number[]>([]);
  const pathname = usePathname();
  const { width, height } = useWindowDimensions();
  const isPortraitScreen = height > width && !isLandscapeRoute(pathname);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  const isHidden = letter?.letterId != null && hiddenLetterIds.includes(letter.letterId);
  const isOpened = letter?.letterId != null && openedLetterId === letter.letterId;
  const isVisible =
    letter !== null && !isHidden && isAuthenticated && !isHydrating && isPortraitScreen;


  function handleBackdropPress() {
    if (!isOpened || !letter || letter.letterId === null || read.isPending) return;
    const letterId = letter.letterId;
    // 바로 숨기고 읽음은 뒤에서 보낸다. 실패하면 다시 보이게 되돌린다(다음에 다시 뜬다).
    setHiddenLetterIds([...hiddenLetterIds, letterId]);
    read.mutate(letterId, { onError: () => handleReadFailed(letterId) });
  }

  function handleReadFailed(letterId: number) {
    setHiddenLetterIds((ids) => ids.filter((id) => id !== letterId));
  }

  function handleOpenPress() {
    if (letter?.letterId != null) setOpenedLetterId(letter.letterId);
  }

  function handleRetryPress() {
    void query.refetch();
  }

  function handleLaterPress() {
    if (letter?.letterId != null) setHiddenLetterIds([...hiddenLetterIds, letter.letterId]);
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={handleBackdropPress}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="쪽지 닫기"
        className="flex-1 items-center justify-center bg-default-black/30"
        onPress={handleBackdropPress}
      >
        {/* 쪽지 안쪽을 눌렀을 때 닫히지 않도록 이벤트를 여기서 멈춘다(InfernoNoteModal 과 같다). */}
        <Pressable className="w-[344px] max-w-[90%] overflow-hidden rounded-[12px] bg-default-white px-[24px] py-[20px]">
          <InfernoDotBackground variant="modal" />
          <View className="rounded-[8px] bg-default-white px-[24px] py-[20px]">
            {letter && !isOpened ? (
              <PartnerLetterArrival onOpenPress={handleOpenPress} />
            ) : (
              <PartnerLetterPaper
                letter={letter ?? undefined}
                isError={query.isError || read.isError}
                onRetryPress={handleRetryPress}
                onLaterPress={handleLaterPress}
              />
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
