import { PRIVACY_POLICY_DOCUMENT } from '@/src/features/legal/constants/privacy-policy';
import LegalDocumentView from '@/src/features/legal/components/legal-document-view';

/** 개인정보처리방침. 온보딩의 로그인 버튼 아래 링크로 연다 — 로그인 전에도 볼 수 있다. */
export default function PrivacyScreen() {
  return <LegalDocumentView document={PRIVACY_POLICY_DOCUMENT} />;
}
