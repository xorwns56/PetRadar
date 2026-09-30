/* 입력 길이 상한.

   서버의 @Size(MissingRequest·ReportRequest)와 같은 값이어야 한다. 한쪽만
   고치면 화면은 더 받아주는데 서버가 거절하거나, 반대로 서버는 받는데 화면이
   막는 일이 생긴다. 두 파일을 함께 고칠 수 있게 여기 모아 둔다.

   이건 서버 검증을 대신하는 것이 아니라 미리 알려주는 것이다 — 다 적고
   제출한 뒤에 400을 받고 돌아오는 왕복을 없앤다. */

/** varchar(255) 컬럼에 들어가는 한 줄 값 (이름, 제목, 장소) */
export const MAX_LINE = 255;

/** TEXT 컬럼에 들어가는 본문. 한글은 글자당 3바이트라 65,535바이트 아래로 잡은 값 */
export const MAX_BODY = 20000;

/** 아이디. 서버의 UserService.LOGIN_ID_MAX_LENGTH와 같아야 한다 */
export const MAX_LOGIN_ID = 20;
