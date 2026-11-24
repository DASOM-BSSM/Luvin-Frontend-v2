import { KeyboardAvoidingView, Modal, Pressable } from 'react-native';

import WriteDiaryForm, { type WriteDiaryFormProps } from '@/src/features/diaries/components/write-diary-form';

interface WriteDiaryModalProps extends WriteDiaryFormProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * 일기 올리기 / 수정. Figma "일기 올리기"(6031:2645) — 반투명 배경 위에 흰 카드와 버튼이 뜬다.
 * 키보드가 올라오면 카드가 가려지지 않게 `KeyboardAvoidingView` 로 감싼다.
 */
export default function WriteDiaryModal({ visible, onClose, ...formProps }: WriteDiaryModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Android 도 padding 으로 피한다 — edge-to-edge(Expo 57)에서는 Modal 안의 adjustResize 가 동작하지 않아
          behavior 를 비워 두면 키보드가 입력칸을 그대로 덮는다. */}
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <Pressable
          className="flex-1 items-center justify-center bg-default-black/30 px-[33px]"
          onPress={onClose}
        >
          {/* 안쪽을 눌렀을 때 닫히지 않도록 이벤트를 여기서 멈춘다. */}
          <Pressable className="w-full max-w-[336px]">
            {visible ? <WriteDiaryForm {...formProps} /> : null}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
