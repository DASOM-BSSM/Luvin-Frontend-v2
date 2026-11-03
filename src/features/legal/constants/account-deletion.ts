import { SERVICE_INFO } from '@/src/features/legal/constants/service-info';
import type { LegalDocument } from '@/src/features/legal/types';

/**
 * 계정 삭제 안내. Google Play 데이터 보안 양식에 "계정 삭제를 요청하는 웹 URL"이 필수라 웹 페이지
 * (docs/legal-site)로만 만든다 — 앱 안에서는 마이페이지에서 바로 탈퇴할 수 있어 따로 화면을 두지 않는다.
 *
 * ⚠️ "삭제되는 정보"는 서버가 실제로 지우는 범위와 같아야 한다 — 백엔드와 확인할 것.
 */
export const ACCOUNT_DELETION_DOCUMENT: LegalDocument = {
  title: '계정 삭제 안내',
  sections: [
    {
      title: '앱에서 바로 삭제하기',
      items: [
        '앱을 열고 홈 화면 오른쪽 위의 프로필 아이콘을 눌러 마이페이지로 가요.',
        '"내 정보 자세히 보기"를 눌러요.',
        '"계정 탈퇴"를 누르고 한 번 더 확인하면 바로 삭제돼요.',
      ],
    },
    {
      title: '앱 없이 삭제 요청하기',
      body:
        `앱을 쓸 수 없다면 ${SERVICE_INFO.contactEmail} 으로 삭제를 요청해 주세요. 로그인할 때 쓴 방식` +
        '(Google 또는 Apple)과 이메일 주소를 함께 적어주시면 본인 확인 후 지체 없이 삭제해 드려요.',
    },
    {
      title: '삭제되는 정보',
      body: '계정을 삭제하면 아래 정보가 모두 지워지고 되돌릴 수 없어요.',
      items: [
        '계정과 프로필(닉네임, 성별, 나이)',
        '연애 성향 테스트 응답과 결과',
        '러빈지옥 진행 기록',
        '감정일기의 일기 · 질문 답변 · 댓글 · 이모지 반응',
        '미니게임 기록과 토큰',
        'Apple로 가입한 경우 Apple 계정 연동',
      ],
    },
    {
      title: '보관되는 정보',
      body: '관련 법령에 따라 보관해야 하는 정보는 정해진 기간 동안 보관한 뒤 파기해요.',
      items: ['통신비밀보호법에 따른 접속 기록: 3개월'],
    },
  ],
};
