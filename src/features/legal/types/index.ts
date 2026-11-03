/** 앱 소개 · 개인정보처리방침 같은 글 화면의 한 단락. */
export interface LegalSection {
  title: string;
  /** 단락 첫 설명. 없으면 목록만 보인다. */
  body?: string;
  /** "· " 로 시작하는 목록. */
  items?: readonly string[];
}

export interface LegalDocument {
  title: string;
  /** 제목 아래 작게 보이는 한 줄(시행일 등). */
  caption?: string;
  sections: readonly LegalSection[];
}
