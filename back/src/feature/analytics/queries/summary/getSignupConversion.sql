-- @target_date 파라미터만 사용합니다.
MERGE {{- DESTINATION_TABLE -}} AS target
USING (
  SELECT
    DATE(@target_date) AS summary_date,
    COUNT(CASE WHEN event_name = 'screen_view' AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'firebase_screen') = 'SignUpScreen' THEN 1 END) AS signup_page_pv,
    COUNT(CASE WHEN event_name = 'sign_up' THEN 1 END) AS signup_complete_users
  FROM
    {{- GA4_EVENTS_TABLE -}}
  WHERE
    PARSE_DATE('%Y%m%d', event_date) = DATE(@target_date)
    AND (event_name = 'screen_view' OR event_name = 'sign_up')
) AS source
ON target.summary_date = source.summary_date
WHEN MATCHED THEN
  UPDATE SET
    signup_page_pv = source.signup_page_pv,
    signup_complete_users = source.signup_complete_users
WHEN NOT MATCHED THEN
  INSERT (summary_date, signup_page_pv, signup_complete_users)
  VALUES (source.summary_date, source.signup_page_pv, source.signup_complete_users);