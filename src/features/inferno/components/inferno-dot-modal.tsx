import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';

import InfernoDotBackground from '@/src/features/inferno/components/inferno-dot-background';

interface InfernoDotModalProps {
  visible: boolean;
  /** 바깥 쪽지 최소 폭 클래스. 시안 값을 `min-w-[…]` 문자열 그대로 넘긴다(InfernoNoteModal 주석 참고). */
  minWidthClass: string;
  /** 스크린리더가 읽는 바깥 영역 이름. 예: "VOTE 닫기" */
  closeLabel: string;
  /** 바깥을 누르거나 안드로이드 뒤로가기를 했을 때. */
  onClose: () => void;
  children: ReactNode;
}

/**
 * 물방울 무늬 종이 위에 흰 쪽지가 한 겹 얹힌 러빈지옥 모달 껍데기. Figma `ep1-투표` (5466:4550),
 * `ep1-전체대화` 반죽 소개(7855:3948), REBAKE(7856:3959).
 *
 * 바깥이 무늬(반경 12, 여백 24/20), 안쪽이 흰 쪽지(반경 8, 여백 30/20)다. 쪽지 안 내용만
 * 모달마다 달라서 children 으로 받는다.
 */
export default function InfernoDotModal({
  visible,
  minWidthClass,
  closeLabel,
  onClose,
  children,
}: InfernoDotModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      // iOS 는 모달을 별도 뷰컨트롤러로 띄우는데 이 값의 기본이 세로뿐이라, 가로로 잠긴
      // 러빈지옥에서 그대로 띄우면 "지원 방향이 겹치지 않는다"며 앱이 죽는다(시뮬레이터에서
      // 실제로 죽는 것을 확인했다. 안드로이드에는 없는 제약이라 그쪽만 보면 놓친다).
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={closeLabel}
        className="flex-1 items-center justify-center bg-default-black/30"
        onPress={onClose}
      >
        {/* 안쪽을 눌렀을 때 닫히지 않도록 이벤트를 여기서 멈춘다. */}
        <Pressable
          className={`max-w-[90%] overflow-hidden rounded-[12px] bg-default-white px-[24px] py-[20px] ${minWidthClass}`}
        >
          <InfernoDotBackground variant="modal" />
          <View className="rounded-[8px] bg-default-white px-[30px] py-[20px]">{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
