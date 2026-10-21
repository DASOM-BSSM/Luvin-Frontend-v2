import { View } from 'react-native';

import Text from '@/src/components/ui/text';
import type { InfernoFinalMatchProfile } from '@/src/features/inferno/types';

/** 다시 보기에서 고른 반죽 기록이 없을 때(기록을 남기기 전에 한 투표) 보여주는 문구. */
const NO_PARTNER_MESSAGE = '기록된 투표가 없어요';

interface InfernoFinalMatchNamesProps {
  partner?: InfernoFinalMatchProfile;
  summaryLine?: string;
  tendencyLabel?: string;
}

/**
 * 반죽 줄 아래 글(Figma 6825:5213): 상대 이름(H4) + 성향 라벨(Body/S) 한 줄, 그 아래 한 줄 요약(Body/S).
 * 글자색은 Figma 가 토큰이 아닌 순수 검정(#000)을 써서 미니게임 안내문과 같은 `inferno-instruction` 을 쓴다.
 */
export default function InfernoFinalMatchNames({
  partner,
  summaryLine,
  tendencyLabel,
}: InfernoFinalMatchNamesProps) {
  return (
    <View className="flex-col items-center gap-[8px]">
      <View className="flex-row items-center gap-[20px]">
        <Text variant="heading-h4" className="text-inferno-instruction">
          {partner ? partner.name : NO_PARTNER_MESSAGE}
        </Text>
        {partner && tendencyLabel ? (
          <Text variant="body-s" className="text-inferno-instruction">
            {tendencyLabel}
          </Text>
        ) : null}
      </View>
      {summaryLine ? (
        <Text variant="body-s" className="text-center text-inferno-instruction">
          {summaryLine}
        </Text>
      ) : null}
    </View>
  );
}
