import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import AngleUpIcon from '@/src/assets/icons/AngleUpIcon';
import ProfileAvatarPhoto from '@/src/assets/images/ProfileAvatarPhoto';
import BottomNav from '@/src/components/bottom-nav';
import Button from '@/src/components/ui/button';
import Screen from '@/src/components/ui/screen';
import Text from '@/src/components/ui/text';
import GenderSelectButton from '@/src/features/my-page/components/gender-select-button';
import NicknameEditField from '@/src/features/my-page/components/nickname-edit-field';
import { MOCK_USER } from '@/src/features/my-page/constants/mock-user';
import { useProfileSettingsStore } from '@/src/features/my-page/store/profile-settings-store';
import { useTokenStore } from '@/src/features/luvin-hell/store/token-store';

/**
 * 내 정보 자세히 보기/수정. Figma "내 정보 수정-미수"(6300:8004).
 *
 * 마이페이지의 "내 정보 자세히 보기" 버튼 목적지. 로그아웃/탈퇴는 백엔드 연동 전이라 실제 인증
 * 처리는 없고, 확인 후 온보딩으로 돌려보내는 것까지만 한다.
 */
export default function MyPageEditScreen() {
  const balance = useTokenStore((state) => state.balance);
  const gender = useProfileSettingsStore((state) => state.gender);
  const setGender = useProfileSettingsStore((state) => state.setGender);

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/my-page');
  }

  function handleFemaleSelect() {
    setGender('female');
  }

  function handleMaleSelect() {
    setGender('male');
  }

  function handleSaveInfoPress() {
    handleBackPress();
  }

  function handleLogoutPress() {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => router.replace('/onboarding') },
    ]);
  }

  function handleWithdrawPress() {
    Alert.alert('계정 탈퇴', '정말 계정을 탈퇴하시겠어요? 이 작업은 되돌릴 수 없어요.', [
      { text: '취소', style: 'cancel' },
      { text: '탈퇴', style: 'destructive', onPress: () => router.replace('/onboarding') },
    ]);
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-col items-end gap-[80px] px-[30px] pb-[24px] pt-[26px]"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full flex-col items-start gap-[40px]">
          <View className="w-full flex-row items-end gap-[12px]">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="뒤로가기"
              className="size-[24px] items-center justify-center"
              onPress={handleBackPress}
            >
              <View className="-rotate-90">
                <AngleUpIcon />
              </View>
            </Pressable>
            <Text variant="heading-h4" className="text-text-primary">
              내 정보 자세히 보기
            </Text>
          </View>

          <View className="w-full flex-col items-center justify-center gap-[16px] rounded-[8px] border border-default-gray px-[30px] py-[12px]">
            <View className="w-full flex-row items-center gap-[20px]">
              <ProfileAvatarPhoto gender={gender} />
              <View className="flex-1 flex-col items-start justify-center gap-[4px]">
                <View className="flex-row items-center gap-[12px]">
                  <Text variant="heading-h4" className="text-text-primary">
                    {MOCK_USER.name}
                  </Text>
                  <Text variant="body-s" className="text-text-primary">
                    {MOCK_USER.title}
                  </Text>
                </View>
                <Text variant="body-xs" className="text-default-black">
                  현재 보유 토큰: 🥐x{balance}
                </Text>
              </View>
            </View>
          </View>

          <View className="w-full flex-col items-start gap-[60px]">
            <View className="w-full flex-col items-start gap-[24px]">
              <View className="w-full flex-col items-start gap-[8px]">
                <Text variant="heading-h5" className="text-text-primary">
                  어떻게 불러드릴까요?
                </Text>
                <NicknameEditField />
              </View>

              <View className="w-full flex-col items-start gap-[12px]">
                <View className="flex-col items-start gap-[4px]">
                  <Text variant="heading-h5" className="text-text-primary">
                    성별을 알려주세요
                  </Text>
                  <Text variant="body-xs" className="text-text-muted">
                    캐릭터의 성별을 정할때 외에는 사용하지 않습니다
                  </Text>
                </View>
                <View className="flex-row items-start gap-[8px]">
                  <GenderSelectButton
                    label="여성"
                    selected={gender === 'female'}
                    onPress={handleFemaleSelect}
                  />
                  <GenderSelectButton
                    label="남성"
                    selected={gender === 'male'}
                    onPress={handleMaleSelect}
                  />
                </View>
              </View>
            </View>

            <Button
              label="내 정보 저장하기"
              variant="infoSave"
              onPress={handleSaveInfoPress}
            />
          </View>
        </View>

        <View className="flex-row items-center gap-[12px]">
          <Pressable accessibilityRole="button" onPress={handleLogoutPress}>
            <Text variant="body-s" className="text-state-error">
              로그아웃
            </Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={handleWithdrawPress}>
            <Text variant="body-s" className="text-text-muted">
              계정 탈퇴
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <View className="pb-[10px]">
        <BottomNav active="none" />
      </View>
    </Screen>
  );
}
