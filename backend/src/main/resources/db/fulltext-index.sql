-- 실종 글 전문검색용 FULLTEXT 인덱스 (MySQL 8, ngram 파서)
--
-- 평소에는 FullTextIndexInitializer가 기동 시 없으면 만든다. 이 파일은
-- 손으로 확인하거나 다시 만들 때 쓴다.
--
-- ngram 파서는 글을 2글자씩 겹쳐 쪼갠다("구로구" -> 구로, 로구). 기본 파서는
-- 공백으로만 잘라서 한국어는 조사가 붙은 채 한 덩어리가 되고, 그래서 "구로"로
-- 검색해도 "구로구"가 걸리지 않았다.
--
-- 인덱스가 넷인 이유: 하나의 FULLTEXT 인덱스 안에서는 칼럼별 가중치를 줄 수 없다.
-- 품종을 제목보다 높게 치려면 칼럼별로 인덱스를 두고 점수를 더해야 한다.
-- ft_missing_all은 WHERE 절에서 후보를 추리는 용도다.
--
-- InnoDB는 FULLTEXT 인덱스를 한 번에 하나씩만 만든다(ERROR 1795). 문장을 나눌 것.

alter table missing add fulltext index ft_missing_all
  (title, content, pet_name, pet_breed, pet_missing_place) with parser ngram;

alter table missing add fulltext index ft_missing_breed (pet_breed) with parser ngram;

alter table missing add fulltext index ft_missing_title (title) with parser ngram;

alter table missing add fulltext index ft_missing_place (pet_missing_place) with parser ngram;
