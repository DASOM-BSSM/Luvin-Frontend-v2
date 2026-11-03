import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import BackHeader from '@/src/components/ui/back-header';
import Screen from '@/src/components/ui/screen';
import Text from '@/src/components/ui/text';
import type { LegalDocument, LegalSection } from '@/src/features/legal/types';

interface LegalDocumentViewProps {
  document: LegalDocument;
}

const SectionView = ({ section }: { section: LegalSection }) => (
  <View className="w-full gap-[8px]">
    <Text variant="heading-h5" className="text-text-primary">
      {section.title}
    </Text>
    {section.body ? (
      <Text variant="body-s" className="text-text-secondary">
        {section.body}
      </Text>
    ) : null}
    {section.items?.map((item) => (
      <Text key={item} variant="body-s" className="text-text-secondary">
        {`· ${item}`}
      </Text>
    ))}
  </View>
);

/**
 * 앱 소개 · 개인정보처리방침처럼 제목과 단락만 있는 글 화면. Figma 시안이 없어 그룹 만들기 등의
 * 뒤로가기 머리(`BackHeader`)와 가로 여백 30(온보딩)을 빌려 왔다 — 디자인이 나오면 맞출 것.
 *
 * 로그인 전(온보딩)에도 열리므로 로그인 상태를 보지 않는다.
 */
export default function LegalDocumentView({ document }: LegalDocumentViewProps) {
  // 온보딩 링크로 들어오는 게 정상 경로고, 딥링크로 바로 열렸으면 돌아갈 곳이 없다.
  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  }

  return (
    <Screen>
      <View className="w-full px-[30px] py-[16px]">
        <BackHeader title={document.title} onBackPress={handleBackPress} />
      </View>
      <ScrollView className="flex-1" contentContainerClassName="gap-[28px] px-[30px] pb-[40px]">
        {document.caption ? (
          <Text variant="body-xs" className="text-text-muted">
            {document.caption}
          </Text>
        ) : null}
        {document.sections.map((section) => (
          <SectionView key={section.title} section={section} />
        ))}
      </ScrollView>
    </Screen>
  );
}
