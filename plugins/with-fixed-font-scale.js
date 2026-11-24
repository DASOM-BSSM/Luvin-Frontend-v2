// Android 기기 글자 크기 설정(갤럭시 기본 font_scale 1.15 등)을 앱 안에서는 무시하고 항상 1배로 그린다.
// 고정 크기 레이아웃 안 글자만 커져서 잘리고 밀리던 문제(LUV-112) 대응.
// RN 은 글자 크기를 Application 컨텍스트(DisplayMetricsHolder)와 Activity 컨텍스트(Surface fontScale)
// 양쪽에서 읽으므로 둘 다 fontScale 만 1 로 덮어쓴다. 빈 Configuration 은 fontScale 외 값이
// '미정'이라 회전·다크모드 같은 다른 설정은 그대로 따라간다.
const { withMainActivity, withMainApplication } = require('expo/config-plugins');

const MARKER = '// @generated luvin-fixed-font-scale';
const IMPORTS = ['import android.content.Context', 'import android.content.res.Configuration'];

const ATTACH_BASE_CONTEXT = `
  ${MARKER}
  override fun attachBaseContext(base: Context) {
    super.attachBaseContext(base.createConfigurationContext(Configuration().apply { fontScale = 1f }))
  }

`;

const addImports = (src) => {
  const missing = IMPORTS.filter((line) => !src.includes(`${line}\n`));
  if (missing.length === 0) return src;
  return src.replace(/^(package [^\n]+\n)/, `$1\n${missing.join('\n')}\n`);
};

const addAttachBaseContext = (src, classPattern, fileName) => {
  if (src.includes(MARKER)) return src;
  if (!classPattern.test(src)) {
    throw new Error(`with-fixed-font-scale: ${fileName} 에서 클래스 선언을 찾지 못했다.`);
  }
  return addImports(src.replace(classPattern, (match) => `${match}${ATTACH_BASE_CONTEXT}`));
};

const assertKotlin = (language, fileName) => {
  if (language !== 'kt') {
    throw new Error(`with-fixed-font-scale: ${fileName} 가 Kotlin 이 아니다 (${language}).`);
  }
};

const withFixedFontScale = (config) => {
  config = withMainApplication(config, (mod) => {
    assertKotlin(mod.modResults.language, 'MainApplication');
    mod.modResults.contents = addAttachBaseContext(
      mod.modResults.contents,
      /class MainApplication\s*:[^{]*\{\n/,
      'MainApplication',
    );
    return mod;
  });
  return withMainActivity(config, (mod) => {
    assertKotlin(mod.modResults.language, 'MainActivity');
    mod.modResults.contents = addAttachBaseContext(
      mod.modResults.contents,
      /class MainActivity\s*:[^{]*\{\n/,
      'MainActivity',
    );
    return mod;
  });
};

module.exports = withFixedFontScale;
