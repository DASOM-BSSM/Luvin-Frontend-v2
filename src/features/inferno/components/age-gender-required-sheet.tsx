/**
 * [DRAFT] 나이·성별 입력 바텀시트. 1화 본문이 409 `AGE_REQUIRED` 로 막히면 띄우고, 둘을 한 화면에서
 * 같이 확인받아 `PUT /api/users/me { age, gender }` 로 함께 보낸다(계약 v4). 둘 다 정해야 저장할 수
 * 있고 "선택 안 함"은 없다. 이미 프로필에 있는 값은 미리 채워 두고 확인만 받는다.
 *
 * 시안이 없어 기존 토큰과 Button·나이 칩·성별 칩(마이페이지와 같은 컴포넌트)으로만 그린다.
 */
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import useSaveStoryProfile from '@/src/features/inferno/hooks/use-save-story-profile';
import AgeSelectField from '@/src/features/my-page/components/age-select-field';
import GenderSelectButton from '@/src/features/my-page/components/gender-select-button';
import type { Gender } from '@/src/features/my-page/types';
import { toKnownAge } from '@/src/features/my-page/utils/age';
import { toKnownGender } from '@/src/features/my-page/utils/gender';
import useMyProfile from '@/src/features/user/hooks/use-my-profile';

interface AgeGenderRequiredSheetProps {
  visible: boolean;
  onSaved: () => void;
  onClose: () => void;
}

export default function AgeGenderRequiredSheet({
  visible,
  onSaved,
  onClose,
}: AgeGenderRequiredSheetProps) {
  const profile = useMyProfile();
  const [pickedAge, setPickedAge] = useState<number>();
  const [pickedGender, setPickedGender] = useState<Gender>();
  const save = useSaveStoryProfile(onSaved);
  // 고르지 않았으면 프로필에 이미 있는 값으로 채운다. 프로필은 늦게 올 수 있어서 state 에 복사하지 않는다.
  const age = pickedAge ?? toKnownAge(profile.data?.age);
  const gender = pickedGender ?? toKnownGender(profile.data?.gender);
  const canSave = age !== undefined && gender !== undefined && !save.isPending;

  function handleFemalePress() {
    setPickedGender('female');
  }

  function handleMalePress() {
    setPickedGender('male');
  }

  function handleSavePress() {
    if (age === undefined || gender === undefined || save.isPending) return;
    save.mutate({ age, gender });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      // 러빈지옥은 가로로 잠겨 있어서 iOS 에서 세로만 허용하면 앱이 죽는다(InfernoDotModal 주석 참고).
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="닫기"
        className="flex-1 justify-end bg-default-black/30"
        onPress={onClose}
      >
        <Pressable className="w-full flex-col items-center gap-[12px] rounded-t-[12px] bg-default-white px-[30px] pb-[24px] pt-[20px]">
          <Text variant="heading-h4" className="text-text-primary">
            나이와 성별을 알려주세요
          </Text>
          <Text variant="body-s" className="text-center text-text-muted">
            {ERROR_MESSAGES.ageRequired}
          </Text>
          <View className="flex-row items-center gap-[24px]">
            <View className="flex-row items-center gap-[8px]">
              <Text variant="body-s" className="text-text-primary">
                나이
              </Text>
              <AgeSelectField value={age} onChange={setPickedAge} />
            </View>
            <View className="flex-row items-center gap-[8px]">
              <Text variant="body-s" className="text-text-primary">
                성별
              </Text>
              <GenderSelectButton
                label="여성"
                selected={gender === 'female'}
                onPress={handleFemalePress}
              />
              <GenderSelectButton label="남성" selected={gender === 'male'} onPress={handleMalePress} />
            </View>
          </View>
          {save.isError ? (
            <Text variant="body-s" className="text-state-error">
              {ERROR_MESSAGES.ageSaveFailed}
            </Text>
          ) : null}
          <View className="w-full items-center">
            <Button
              label={save.isPending ? '저장하는 중…' : '저장하고 시작하기'}
              disabled={!canSave}
              onPress={handleSavePress}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
