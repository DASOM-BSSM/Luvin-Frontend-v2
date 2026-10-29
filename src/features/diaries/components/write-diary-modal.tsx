import { KeyboardAvoidingView, Modal, Platform, Pressable } from 'react-native';

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
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
