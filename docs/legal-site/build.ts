/**
 * 앱 소개 · 개인정보처리방침 웹 페이지 생성기. `pnpm build:legal-site` 로 실행한다.
 *
 * Google OAuth 동의 화면과 App Store Connect 에는 공개된 웹 URL 을 넣어야 해서, 앱 화면(/about, /privacy)과
 * 같은 상수(src/features/legal/constants)로 정적 HTML 을 만든다 — 글을 한 곳에서만 고치면 앱과 웹이 같이
 * 바뀐다. 결과물은 docs/legal-site/public/ 에 생기고, 그 폴더만 웹에 올리면 된다(README 참고).
 *
 * Node 스크립트라 앱 tsconfig 의 typecheck 에서는 뺐다(tsconfig exclude) — 앱에는 Node 타입이 없다.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { colors } from '@/src/constants/colors';
import { ABOUT_DOCUMENT } from '@/src/features/legal/constants/about';
import { ACCOUNT_DELETION_DOCUMENT } from '@/src/features/legal/constants/account-deletion';
import { PRIVACY_POLICY_DOCUMENT } from '@/src/features/legal/constants/privacy-policy';
import { SERVICE_INFO } from '@/src/features/legal/constants/service-info';
import type { LegalDocument, LegalSection } from '@/src/features/legal/types';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), 'public');

/**
 * Google Search Console 소유 확인 값. Search Console → URL 접두어 → "HTML 태그" 방식에서 주는
 * `<meta name="google-site-verification" content="...">` 의 content 값만 여기 넣고 다시 빌드한다.
 * 비어 있으면 태그를 넣지 않는다. 비밀값이 아니라 커밋해도 된다.
 */
const GOOGLE_SITE_VERIFICATION = '';

interface Page {
  fileName: string;
  document: LegalDocument;
}

const PAGES: readonly Page[] = [
  { fileName: 'index.html', document: ABOUT_DOCUMENT },
  { fileName: 'privacy.html', document: PRIVACY_POLICY_DOCUMENT },
  { fileName: 'delete-account.html', document: ACCOUNT_DELETION_DOCUMENT },
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 글 안의 줄바꿈(\n)은 <br> 로 바꾼다. */
function toHtmlText(value: string): string {
  return escapeHtml(value).replace(/\n/g, '<br>');
}

function renderSection(section: LegalSection): string {
  const body = section.body ? `<p>${toHtmlText(section.body)}</p>` : '';
  const items = section.items
    ? `<ul>${section.items.map((item) => `<li>${toHtmlText(item)}</li>`).join('')}</ul>`
    : '';
  return `<section><h2>${escapeHtml(section.title)}</h2>${body}${items}</section>`;
}

function renderPage({ document }: Page): string {
  const title = `${document.title} | ${SERVICE_INFO.serviceName}`;
  const caption = document.caption ? `<p class="caption">${escapeHtml(document.caption)}</p>` : '';
  const verification = GOOGLE_SITE_VERIFICATION
    ? `<meta name="google-site-verification" content="${escapeHtml(GOOGLE_SITE_VERIFICATION)}">\n`
    : '';

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${verification}<title>${escapeHtml(title)}</title>
<style>
  :root {
    --bg: ${colors.default.bg};
    --text: ${colors.text.primary};
    --text-secondary: ${colors.text.secondary};
    --muted: ${colors.text.muted};
    --line: ${colors.default.gray};
    --accent: ${colors.yellow[400]};
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
    line-height: 1.6;
  }
  main { max-width: 720px; margin: 0 auto; padding: 32px 16px 64px; }
  nav { display: flex; flex-wrap: wrap; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--line); }
  nav a { color: var(--muted); text-decoration: none; font-size: 14px; }
  nav a[aria-current="page"] { color: var(--text); font-weight: 700; box-shadow: inset 0 -6px 0 var(--accent); }
  h1 { font-size: 26px; margin: 28px 0 4px; }
  .caption { color: var(--muted); font-size: 13px; margin: 0 0 8px; }
  section { margin-top: 28px; }
  h2 { font-size: 17px; margin: 0 0 8px; }
  p, li { color: var(--text-secondary); font-size: 15px; }
  p { margin: 0 0 8px; }
  ul { margin: 0; padding-left: 20px; }
  footer { margin-top: 48px; color: var(--muted); font-size: 13px; }
</style>
</head>
<body>
<main>
<nav>
${PAGES.map(
  (page) =>
    `<a href="./${page.fileName}"${page.document === document ? ' aria-current="page"' : ''}>${escapeHtml(page.document.title)}</a>`,
).join('\n')}
</nav>
<h1>${escapeHtml(document.title)}</h1>
${caption}
${document.sections.map(renderSection).join('\n')}
<footer>© ${escapeHtml(SERVICE_INFO.operator)} · ${escapeHtml(SERVICE_INFO.contactEmail)}</footer>
</main>
</body>
</html>
`;
}

mkdirSync(OUT_DIR, { recursive: true });
for (const page of PAGES) {
  writeFileSync(join(OUT_DIR, page.fileName), renderPage(page));
}
process.stdout.write(`생성 완료: ${PAGES.map((page) => page.fileName).join(', ')} → ${OUT_DIR}\n`);
