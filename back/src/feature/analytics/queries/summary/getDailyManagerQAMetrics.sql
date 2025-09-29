-- @target_date를 기준으로 매니저 Q&A 응답 확인 관련 지표를 집계합니다.
-- 참고: 분모가 되는 '매니저가 응답을 보낸 상품 수'는 Firebase 이벤트가 아닌,
-- 서비스의 운영 데이터베이스에서 가져와야 할 가능성이 높습니다.
-- 따라서 이 쿼리에서는 분자에 해당하는 값만 집계합니다.

MERGE {{- DESTINATION_TABLE -}} AS target
USING (
  SELECT
    DATE(@target_date) AS summary_date,
    -- 분자: 응답을 받은 페이지로 진입한 유저 수 (푸시 클릭 기준)
    COUNTIF(event_name = 'manager_answer_push_click') AS manager_answer_push_click_count
  FROM
    {{- GA4_EVENTS_TABLE -}}
  WHERE
    PARSE_DATE('%Y%m%d', event_date) = DATE(@target_date)
) AS source
ON target.summary_date = source.summary_date
WHEN MATCHED THEN
  UPDATE SET
    manager_answer_push_click_count = source.manager_answer_push_click_count
WHEN NOT MATCHED THEN
  INSERT (summary_date, manager_answer_push_click_count)
  VALUES (source.summary_date, source.manager_answer_push_click_count);