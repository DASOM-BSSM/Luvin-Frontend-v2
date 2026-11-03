import { ABOUT_DOCUMENT } from '@/src/features/legal/constants/about';
import LegalDocumentView from '@/src/features/legal/components/legal-document-view';

/** 앱 소개. 온보딩의 로그인 버튼 아래 링크로 연다 — 로그인 전에도 볼 수 있다. */
export default function AboutScreen() {
  return <LegalDocumentView document={ABOUT_DOCUMENT} />;
}
