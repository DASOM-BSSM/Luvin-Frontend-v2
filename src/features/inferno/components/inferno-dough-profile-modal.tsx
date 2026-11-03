import { View } from 'react-native';

import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import InfernoDotModal from '@/src/features/inferno/components/inferno-dot-modal';
import { findDoughFigure } from '@/src/features/inferno/constants/dough-figures';
import type { DoughProfile } from '@/src/features/inferno/utils/dough-profile';

interface InfernoDoughProfileModalProps {
  /** null 이면 닫혀 있다. */
  profile: DoughProfile | null;
  onClose: () => void;
}

/**
 * 전체대화에서 반죽 칩을 누르면 뜨는 소개. Figma `ep1-전체대화` modal (7855:3948).
 *
 * 위에 반죽 그림과 이름·관계가 20 간격으로 나란히, 아래에 특징을 점 목록으로 둔다.
 * 시안에 닫기 버튼이 없어서 바깥을 누르거나 뒤로가기로 닫는다(InfernoNoteModal 과 같다).
 */
export default function InfernoDoughProfileModal({
  profile,
  onClose,
}: InfernoDoughProfileModalProps) {
  return (
    <InfernoDotModal
      visible={profile !== null}
      minWidthClass="min-w-[367px]"
      closeLabel="반죽 소개 닫기"
      onClose={onClose}
    >
      {profile ? (
        <View className="flex-col gap-[20px]">
          <View className="flex-row items-center justify-center gap-[20px]">
            <BreadCharacter
              type={profile.type}
              state="personDough"
              className={findDoughFigure(profile.type).chatSizeClass}
            />
            <View className="flex-col items-center">
              <Text variant="heading-h4" className="text-inferno-instruction">
                {profile.name}
              </Text>
              {profile.role ? (
                <Text variant="body-xs" className="text-inferno-instruction">
                  {profile.role}
                </Text>
              ) : null}
            </View>
          </View>
          {profile.facts.length > 0 ? (
            <View className="flex-col gap-[8px]">
              {profile.facts.map((fact) => (
                <View key={fact} className="flex-row gap-[8px]">
                  <Text variant="body-xs" className="text-inferno-instruction">
                    •
                  </Text>
                  <Text variant="body-xs" className="shrink text-inferno-instruction">
                    {fact}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </InfernoDotModal>
  );
}
