# Luvin 앱 소개 · 개인정보처리방침 웹 페이지

Google OAuth 동의 화면과 App Store Connect에는 **공개된 웹 URL**이 필요해서 만든 정적 페이지입니다.
글 내용은 앱의 `/about`, `/privacy` 화면과 같은 파일(`src/features/legal/constants/`)에서 나옵니다.

| 파일                  | 내용             |
| --------------------- | ---------------- |
| `public/index.html`   | 앱 소개 (홈페이지) |
| `public/privacy.html` | 개인정보처리방침   |
| `public/delete-account.html` | 계정 삭제 안내 (Google Play 데이터 보안 양식용) |

## 글을 고쳤을 때

1. `src/features/legal/constants/` 안의 글을 고친다 (`service-info.ts`, `about.ts`, `privacy-policy.ts`, `account-deletion.ts`)
2. `pnpm build:legal-site` 실행 → `public/`의 HTML이 다시 만들어진다
3. 바뀐 `public/` 파일을 아래에서 올린 곳에 다시 올린다

앱 화면은 빌드만 다시 하면 같이 바뀝니다.

## 올리는 방법 (GitHub Pages 예시)

이 저장소에 바로 Pages를 켜지 마세요. `docs/` 안의 다른 내부 문서까지 공개됩니다.
따로 **공개 저장소**를 하나 만들어 `public/` 안의 파일만 올립니다.

1. GitHub에서 `DASOM-BSSM` 조직에 공개 저장소를 만든다 (예: `luvin-legal`)
2. `public/` 안의 HTML 파일 세 개를 저장소 맨 위에 올린다
3. 저장소 **Settings → Pages** → Source: `Deploy from a branch`, Branch: `main` / `/ (root)` → Save
4. 1~2분 뒤 아래 주소로 열리는지 확인한다
   - 홈페이지: `https://dasom-bssm.github.io/luvin-legal/`
   - 개인정보처리방침: `https://dasom-bssm.github.io/luvin-legal/privacy.html`
   - 계정 삭제 안내: `https://dasom-bssm.github.io/luvin-legal/delete-account.html`

## Google Cloud 동의 화면에 넣기

- **앱 홈페이지**: 위 홈페이지 주소
- **개인정보처리방침 링크**: 위 개인정보처리방침 주소
- **승인된 도메인**: `dasom-bssm.github.io`
- 도메인 소유 확인: [Google Search Console](https://search.google.com/search-console) → URL 접두어에 위 홈페이지 주소 등록
  → 확인 방법 **HTML 태그** → `<meta name="google-site-verification" content="...">`의 **content 값**을
  `docs/legal-site/build.ts`의 `GOOGLE_SITE_VERIFICATION`에 넣고 `pnpm build:legal-site` → 다시 올린 뒤 "확인"
  - Search Console에 쓰는 Google 계정은 Cloud 프로젝트 소유자 계정과 같아야 한다.

## Google Play Console에 넣기

- 앱 콘텐츠 → 데이터 보안 → **계정 삭제 URL**: 위 계정 삭제 안내 주소

## App Store Connect에 넣기

- 앱 정보 → **개인정보 처리방침 URL**: 위 개인정보처리방침 주소
- 앱 안에서는 온보딩(로그인 버튼 아래)과 마이페이지 맨 아래 링크로 같은 글을 볼 수 있다.
