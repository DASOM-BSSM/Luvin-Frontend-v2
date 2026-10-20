import { Pressable, View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import { okMallangBTitleStyle } from '@/src/constants/typography';
import type { InfernoPartnerLetter } from '@/src/features/inferno/types';

interface PartnerLetterPaperProps {
  /** 받아 온 쪽지. 아직 받는 중이거나 받지 못했으면 undefined. */
  letter: InfernoPartnerLetter | undefined;
  isError: boolean;
  onRetryPress: () => void;
  /** 받지 못했을 때 이번만 넘어가기. 읽은 것으로 치지 않는다. */
  onLaterPress: () => void;
}

/**
 * [DRAFT] 펼친 쪽지. Figma 시안이 없어 사용자 설명대로 짰다 — 물방울 무늬 테두리 위 흰 쪽지에
 * OK Mallang B 로 "SECRET LOVE", 그 밑에 본문, 맨 아래에 보낸 사람. 무늬 테두리는 PartnerLetterModal 이 깐다.
 *
 * 닫기 버튼은 두지 않는다 — 쪽지 바깥 빈 곳을 누르면 닫힌다(사용자 지정, PartnerLetterModal).
 * 보낸 사람(From.)은 본문 밑에 흐린 글씨(text-muted)로 둔다(사용자 지정).
 *
 * NOTE: 제목은 Tailwind 클래스가 아니라 style 로 폰트를 넣는다. `font-ok-mallang-b` 는
 * 실기기에서 폰트가 깨진다(src/constants/typography.ts 주석 참고).
 *
 * 받는 중/실패도 같은 쪽지 안에서 보여준다(§11) — 제목은 그대로 두고 본문 자리만 바꿔서
 * 받아 온 뒤에도 쪽지 모양이 흔들리지 않게 한다.
 */
export default function PartnerLetterPaper({
  letter,
  isError,
  onRetryPress,
  onLaterPress,
}: PartnerLetterPaperProps) {
  function renderBody() {
    if (letter) {
      return (
        <>
          <Text variant="body-m" className="text-center text-default-black">
            {letter.message}
          </Text>
          <Text variant="body-s" className="text-center text-text-muted">
            {`From. ${letter.partnerName}`}
          </Text>
        </>
      );
    }

    return (
      <Text variant="body-m" className="text-center text-default-black">
        {isError ? ERROR_MESSAGES.partnerLetterFailed : '쪽지를 펼치고 있어요...'}
      </Text>
    );
  }

  return (
    <View className="flex-col items-center gap-[20px]">
      <View className="w-full flex-col items-center gap-[4px]">
        <Text className="text-center text-pink-500" style={okMallangBTitleStyle}>
          SECRET LOVE
        </Text>
        {renderBody()}
      </View>
      {/* 받지 못했을 때만 버튼을 둔다. 받은 쪽지는 바깥을 눌러 닫는다. */}
      {!letter && isError ? (
        <View className="w-full flex-col items-center gap-[12px]">
          <Button label="다시 시도" variant="notice" onPress={onRetryPress} />
          <Pressable accessibilityRole="button" accessibilityLabel="나중에 보기" onPress={onLaterPress}>
            <Text variant="body-s" className="text-default-black">
              나중에 보기
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
