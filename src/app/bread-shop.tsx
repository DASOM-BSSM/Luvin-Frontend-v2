import { router } from 'expo-router';
import { View } from 'react-native';

import BackHeader from '@/src/components/ui/back-header';
import Button from '@/src/components/ui/button';
import Screen from '@/src/components/ui/screen';
import Text from '@/src/components/ui/text';

/**
 * [DRAFT] 식빵(유료 토큰) 구매 화면(LUV-116). 시안이 없어 기존 카드·버튼 모양으로만 그렸다.
 * 인앱결제는 아직 연동하지 않아서 구매 버튼은 막혀 있다 — 결제 연동은 별도 작업.
 */
const BREAD_BENEFITS = [
  '결제로만 얻을 수 있어요',
  '하루를 기다리지 않고 에피소드를 바로 열 수 있어요',
];

/** 첫 구매 한정 상품. 가격은 정해진 값이라 결제 연동 때 스토어 상품 정보로 바꾼다. */
const FIRST_PURCHASE_PRODUCT = { amount: 20, price: '990원' };

export default function BreadShopScreen() {
  function handleBackPress() {
    router.back();
  }

  return (
    <Screen>
      <View className="flex-1 flex-col gap-[28px] px-[30px] pt-[16px]">
        <BackHeader title="식빵 구매" onBackPress={handleBackPress} />

        <View className="w-full flex-col gap-[8px] rounded-[8px] border border-default-gray bg-yellow-200 p-[20px]">
          <Text variant="body-s" className="text-default-black">
            식빵 🍞
          </Text>
          {BREAD_BENEFITS.map((benefit) => (
            <Text key={benefit} variant="body-s" className="text-text-primary">
              {benefit}
            </Text>
          ))}
        </View>

        <View className="w-full flex-col items-center gap-[12px] rounded-[8px] border border-default-gray px-[20px] py-[24px]">
          <Text variant="body-xs" className="text-pink-500">
            첫 구매 한정
          </Text>
          <Text variant="heading-h3" className="text-text-primary">
            식빵 {FIRST_PURCHASE_PRODUCT.amount}개
          </Text>
          <Text variant="heading-h4" className="text-text-primary">
            {FIRST_PURCHASE_PRODUCT.price}
          </Text>
          <Button label="결제 준비 중이에요" disabled onPress={handleBackPress} />
        </View>
      </View>
    </Screen>
  );
}
