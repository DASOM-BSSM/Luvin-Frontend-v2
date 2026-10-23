/**
 * [DRAFT] 나이 입력 바텀시트. 1화 본문이 409 `AGE_REQUIRED` 로 막히면 띄우고, 저장하면 바로
 * 본문을 다시 요청한다(보정 문서 7장). 시안이 없어 기존 토큰과 Button·나이 칩으로만 그린다.
 */
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import useSaveAge from '@/src/features/inferno/hooks/use-save-age';
import AgeSelectField from '@/src/features/my-page/components/age-select-field';

interface AgeRequiredSheetProps {
  visible: boolean;
  onSaved: () => void;
  onClose: () => void;
}

export default function AgeRequiredSheet({ visible, onSaved, onClose }: AgeRequiredSheetProps) {
  const [age, setAge] = useState<number>();
  const saveAge = useSaveAge(onSaved);

  function handleSavePress() {
    if (age === undefined || saveAge.isPending) return;
    saveAge.mutate(age);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="닫기"
        className="flex-1 justify-end bg-default-black/30"
        onPress={onClose}
      >
        <Pressable className="w-full flex-col items-center gap-[12px] rounded-t-[12px] bg-default-white px-[30px] pb-[24px] pt-[20px]">
          <Text variant="heading-h4" className="text-text-primary">
            나이를 알려주세요
          </Text>
          <Text variant="body-s" className="text-center text-text-muted">
            {ERROR_MESSAGES.ageRequired}
          </Text>
          <AgeSelectField value={age} onChange={setAge} />
          {saveAge.isError ? (
            <Text variant="body-s" className="text-state-error">
              {ERROR_MESSAGES.ageSaveFailed}
            </Text>
          ) : null}
          <View className="w-full items-center">
            <Button
              label={saveAge.isPending ? '저장하는 중…' : '저장하고 시작하기'}
              disabled={age === undefined || saveAge.isPending}
              onPress={handleSavePress}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
