-- @target_date를 기준으로 상품 상세페이지 관련 지표의 구성 요소를 집계합니다.
MERGE {{- DESTINATION_TABLE -}} AS target
USING (
  SELECT
    DATE(@target_date) AS summary_date,
    -- 분모: 상품 상세페이지 PV
    COUNTIF(event_name = 'screen_view' AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'firebase_screen') = 'ProductDetailScreen') AS pdp_pv,
    -- 구매하기 버튼 클릭 수 (전용 이벤트 사용)
    COUNTIF(event_name = 'product_detail_buy_click') AS buy_button_click_count,

    COUNTIF(event_name = 'button_click' AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'button_name') = 'pdp_wishlist') AS wishlist_button_click_count,

    COUNTIF(event_name = 'tab_click' AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'tab') = 'caption') AS caption_tab_click_count,
    COUNTIF(event_name = 'tab_click' AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'tab') = 'report') AS report_tab_click_count,
    COUNTIF(event_name = 'tab_click' AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'tab') = 'review') AS review_tab_click_count,
    COUNTIF(event_name = 'tab_click' AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'tab') = 'question') AS question_tab_click_count

  FROM
    {{- GA4_EVENTS_TABLE -}}
  WHERE
    PARSE_DATE('%Y%m%d', event_date) = DATE(@target_date)
    AND event_name IN ('screen_view', 'product_detail_buy_click', 'button_click', 'tab_click')
) AS source
ON target.summary_date = source.summary_date
WHEN MATCHED THEN
  UPDATE SET
    pdp_pv = source.pdp_pv,
    buy_button_click_count = source.buy_button_click_count,
    wishlist_button_click_count = source.wishlist_button_click_count,
    caption_tab_click_count = source.caption_tab_click_count,
    report_tab_click_count = source.report_tab_click_count,
    review_tab_click_count = source.review_tab_click_count,
    question_tab_click_count = source.question_tab_click_count
WHEN NOT MATCHED THEN
  INSERT (summary_date, pdp_pv, buy_button_click_count, wishlist_button_click_count, caption_tab_click_count, report_tab_click_count, review_tab_click_count, question_tab_click_count)
  VALUES (source.summary_date, source.pdp_pv, source.buy_button_click_count, source.wishlist_button_click_count, source.caption_tab_click_count, source.report_tab_click_count, source.review_tab_click_count, source.question_tab_click_count);