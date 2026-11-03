import { SERVICE_INFO } from '@/src/features/legal/constants/service-info';
import type { LegalDocument } from '@/src/features/legal/types';

/**
 * 앱 소개 글. 로그인 전에 "이 앱이 무엇인지" 알 수 있게 온보딩 아래 링크로 연다(Google 로그인 앱 게시 ·
 * 사용자 결정). Figma 시안이 없어 앱 소개 투어(features/welcome/constants/tour.ts)의 문구를 바탕으로 썼다 —
 * 기획 · 디자인이 나오면 맞출 것.
 */
export const ABOUT_DOCUMENT: LegalDocument = {
  title: '러빈 소개',
  sections: [
    {
      title: '러빈은 어떤 앱인가요?',
      body:
        '사랑은 타이밍이에요. 너무 빠르면 덜 익고, 너무 늦으면 타버리니까요.\n' +
        '러빈은 나의 연애 성향을 빵으로 표현하고, 나를 닮은 AI 분신이 대신 연애를 해보며 ' +
        '나를 알아가는 빵 테마 연애 시뮬레이션 앱이에요.',
    },
    {
      title: '나만의 반죽 만들기',
      body: '몇 가지 질문에 답하면 내 연애 성향이 8가지 빵 중 하나로 빚어져요. 이 결과로 나를 닮은 AI 분신이 만들어져요.',
    },
    {
      title: '러빈지옥',
      body:
        '나를 닮은 AI 분신이 매주 한 편씩 낯선 빵들과 관계를 맺어가요. 분신의 선택을 지켜보며 ' +
        '나의 연애 방식을 돌아볼 수 있어요. 러빈지옥의 이야기와 대화는 AI가 만든 내용이에요.',
    },
    {
      title: '미니게임',
      body: '공룡빵게임, 다솜이의 소금빵게임으로 토큰을 모아 러빈지옥의 다음 에피소드를 열 수 있어요.',
    },
    {
      title: '감정일기',
      body: '친구들과 그룹을 만들어 오늘의 질문에 답하고, 일기와 댓글 · 이모지 반응으로 서로의 마음을 나눠요.',
    },
    {
      title: '로그인과 계정',
      items: [
        'Google 계정으로 로그인할 수 있어요. iPhone에서는 Apple 계정으로도 로그인할 수 있어요.',
        '처음 로그인하면 계정이 바로 만들어져요. 따로 가입하는 과정은 없어요.',
        '마이페이지에서 언제든 로그아웃하거나 회원 탈퇴할 수 있어요.',
      ],
    },
    {
      title: '문의',
      body: `궁금한 점이 있으면 ${SERVICE_INFO.contactEmail} 으로 알려주세요.`,
    },
  ],
};
