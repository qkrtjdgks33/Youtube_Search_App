export type IPost = {
  post: string; // 게시글 내용
  nickname: string; // 작성자 닉네임
  userId: string; // 작성자 ID
  createdAt: number; // 게시글 작성 시간 (timestamp)
  photoUrl?: string; // 프로필 사진 URL (선택적)
  photoUrls?: string[]; // 다중 이미지 URL (선택적)
  email: string; // 작성자 이메일
  id: string; // 게시글 ID
  comments?: {
    userId: string; // 댓글 작성자 ID
    nickname: string; // 댓글 작성자 닉네임
    content: string; // 댓글 내용
    createdAt: number; // 댓글 작성 시간 (timestamp)
  }[]; // 댓글 배열 (선택적)
};
