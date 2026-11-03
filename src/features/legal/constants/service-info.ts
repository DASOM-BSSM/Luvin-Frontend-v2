/**
 * 앱 소개 · 개인정보처리방침에 들어가는 운영 정보. 앱 화면과 웹 페이지(docs/legal-site)가 같이 쓴다 —
 * 값을 바꾸면 `pnpm build:legal-site` 로 웹 페이지도 다시 만들 것.
 */
export const SERVICE_INFO = {
  serviceName: "Luvin",
  /** 운영 주체(팀 · 개인 · 법인 이름). */
  operator: "DASOM",
  /** 개인정보 보호책임자 이름. */
  privacyOfficer: "김지은",
  /** 문의 · 개인정보 요청을 받을 이메일. */
  contactEmail: "dasom090318@gmail.com",
  /** 설문 응답 등으로 이야기를 만드는 AI 업체(백엔드 확인). */
  aiProvider: "OpenAI",
  /** 서버를 운영하는 클라우드 업체(백엔드 확인). */
  hostingProvider: "AWS",
  /** 개인정보처리방침 시행일. */
  effectiveDate: "2026.11.04",
} as const;
