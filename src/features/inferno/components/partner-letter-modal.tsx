import { useState } from 'react';
import { Modal, View } from 'react-native';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import InfernoDotBackground from '@/src/features/inferno/components/inferno-dot-background';
import PartnerLetterArrival from '@/src/features/inferno/components/partner-letter-arrival';
import PartnerLetterPaper from '@/src/features/inferno/components/partner-letter-paper';
import usePartnerLetter from '@/src/features/inferno/hooks/use-partner-letter';
import { usePartnerLetterStore } from '@/src/features/inferno/store/partner-letter-store';

/**
 * [DRAFT] EP5 이후 앱을 다시 열면 가장 먼저 뜨는 쪽지(partner-letter-store.ts 참고). Figma 시안이
 * 없어 사용자 설명대로 러빈지옥 쪽지 모달(InfernoNoteModal)과 같은 두 겹 — 바깥 물방울 무늬(반경 12),
 * 안쪽 흰 쪽지(반경 8) — 으로 짰다.
 *
 * 도착 안내 → 펼친 쪽지를 모달 두 개가 아니라 한 모달 안에서 바꿔 보여준다. iOS 는 모달을 겹쳐
 * 띄우면 뒤의 것이 안 뜨거나 닫히지 않는 문제가 있어서다.
 *
 * 쪽지를 읽기 전에는 바깥을 눌러도, 안드로이드 뒤로가기를 해도 닫히지 않는다 — 어느 화면으로 열리든
 * 쪽지부터 봐야 한다(사용자 결정). 닫는 길은 펼친 쪽지의 "닫기"와, 받지 못했을 때의 "나중에 보기"뿐이다.
 *
 * 루트 레이아웃에 놓여 어느 화면 위에든 뜬다. 러빈지옥은 가로로 잠겨 있어서 두 방향을 다 허용한다
 * (안 그러면 iOS 에서 앱이 죽는다 — InfernoNoteModal 주석 참고).
 */
export default function PartnerLetterModal() {
  const sender = usePartnerLetterStore((state) => state.deliverableSender);
  const markLetterRead = usePartnerLetterStore((state) => state.markLetterRead);
  const hideLetterForNow = usePartnerLetterStore((state) => state.hideLetterForNow);
  const letterQuery = usePartnerLetter(sender);
  const [isOpened, setIsOpened] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  // 로그인이 확인된 뒤에만 띄운다. 로그인 여부를 아직 모르거나(hydrate 중) 로그아웃 상태면 온보딩
  // 위에 쪽지가 뜨게 되므로 기다린다. 그동안 쪽지는 스토어에 남아 있어서, 로그인하면 그때 뜬다.
  const isVisible = sender !== null && isAuthenticated && !isHydrating;

  // 읽은 쪽지는 닫히는 길만 연다. 아직 읽지 않았으면 뒤로가기를 막는다.
  function handleModalRequestClose() {
    if (isOpened && letterQuery.data) {
      markLetterRead();
    }
  }

  function handleOpenPress() {
    setIsOpened(true);
  }

  function handleRetryPress() {
    letterQuery.refetch();
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={handleModalRequestClose}
    >
      <View className="flex-1 items-center justify-center bg-default-black/30">
        <View className="w-[344px] max-w-[90%] overflow-hidden rounded-[12px] bg-default-white px-[24px] py-[20px]">
          <InfernoDotBackground variant="modal" />
          <View className="rounded-[8px] bg-default-white px-[24px] py-[20px]">
            {sender && !isOpened ? (
              <PartnerLetterArrival partnerName={sender.partnerName} onOpenPress={handleOpenPress} />
            ) : (
              <PartnerLetterPaper
                letter={letterQuery.data}
                isError={letterQuery.isError}
                onClosePress={markLetterRead}
                onRetryPress={handleRetryPress}
                onLaterPress={hideLetterForNow}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
