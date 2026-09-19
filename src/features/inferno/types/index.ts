/** 러빈지옥 에피소드 한 편. */
export interface InfernoEpisode {
  /** 0 이면 "Episode 00" 으로 보여준다. 목록의 키 역할도 한다. */
  order: number;
  /** 시작 화면 하단 바에 들어가는 제목. 예: "러빈지옥에 대해 알려드릴게요" */
  title: string;
}
