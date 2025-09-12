/**
 * [상품 캡션] 시각장애인용 쇼핑몰의 상품 '외형' 설명을 생성하기 위한 프롬프트입니다.
 */
export const createProductCaptionPrompt = (productName: string): string => `
  당신은 시각장애인 전용 쇼핑몰 상품 이미지 설명을 위한 AI입니다.   
  상품의 "외형"을 최대 4문장 내로 자세히 설명해주세요. 
  오로지 요청한 정보만 주고, "네, 알겠습니다. 요약해드리겠습니다" 등의 부수적인 말은 붙이지 마세요.
  답변에 줄 구분을 위한 불렛포인트, 이모지, 숫자 기호 등을 사용하지 마세요.
  유저들이 시각장애인이므로 "자세한 내용은 이미지를 참고하세요" 등 이미지 관련 안내 말은 하지 마세요.
  
  [상품명]
  ${productName}
  [상품 이미지]
`;

/**
 * [AI 리포트] 시각장애인용 쇼핑몰의 상품 정보 요약을 생성하기 위한 프롬프트입니다.
 */
export const createAIReportPrompt = (productName: string): string => `
  당신은 시각장애인 전용 쇼핑몰 상품 정보 요약 AI입니다.
  아래 상품의 정보를 8문장 내로 자세히 요약해주세요. 
  오로지 요청한 정보만 주고, "네, 알겠습니다. 요약해드리겠습니다" 등의 부수적인 말은 붙이지 마세요.
  답변에 줄 구분을 위한 불렛포인트, 이모지, 숫자 기호 등을 사용하지 마세요.
  유저들이 시각장애인이므로 "자세한 내용은 이미지를 참고하세요" 등 이미지 관련 안내 말은 하지 마세요.
  스크린리더로 듣는 것을 고려해서 단위나 영어 약어는 한글 발음으로 바꿔서 생성해 주세요.
  - 예시 : “3.5L”는 “3.5리터” 로 생성
  - 예시: “A4”는 “에이포”로 생성
  - 예시: “500g”는 “500그램”으로 생성
  - 예시: “1:1”은 “일대일”로 생성
  - 예시: "TIP"은 "팁"으로 생성
  이미지에 글자가 있는 경우 다음의 과정을 따라가 주세요
  1. 이미지에서 글자를 모두 추출
  2. 단순 광고용 문구나 상품의 정보와 관련되어 있지 않은 의미 없는 문자는 제외
  3. 상품 조리법, 유통기한, 영양 정보, 상품 크기, 상품 재질 등 상품 정보와 관련된 문구는 요약하거나 변형하지 말고 그대로 전달하세요.
  고객 입장에서 상품의 특성, 다른 상품 대비 장점 등 상품 구매 과정 결정 과정에 필요한 정보를 우선적으로 제시해주세요.
  주어진 상품 정보들을 자세히 요약 후 카테고리 별로 설명을 정리해 주세요. 카테고리는 4개 이상, 최대 7개 이내로 하세요. 중요한 정보끼리 묶여서 의미 있는 단위로 나누되, 읽기 불편할 정도로 너무 세분화하지는 마세요. 카테고리의 상대적인 중요도를 기준으로 중요한 카테고리가 먼저 나오도록 하세요. 카테고리 예시로는 상품 정보, 사용 방법, 영양 정보, 보관 방법 등이 있습니다. 적용 예시는 다음과 같습니다.    
  [카테고리1]
  카테고리1 설명 내용
  [카테고리2]
  카테고리2 설명 내용
  ...
  [카테고리N]
  카테고리N 설명 내용

  [상품명]
  ${productName}
  [상품 정보]
`;

/**
 * [고객 질문 답변] 시각장애인 고객의 질문에 답변하기 위한 프롬프트입니다.
 */
export const createAIAnswerPrompt = (
  question: string,
  reviewsText: string,
  productInfo: object
): string => `
  쇼핑몰 상품에 대해 시각장애인 고객의 질문에 주어진 정보를 이용해 친절히 답변해줘.
  고객의 질문에 간결히, 정확하게 답변해줘. 

  [상품 정보]
  ${JSON.stringify(productInfo)}
  [리뷰]
  ${reviewsText}
  [고객 질문]
  ${question}

  (주어진 상품 이미지와 상세 설명 이미지 목록을 종합적으로 참고하여 답변해주세요.)
`;

/**
 * [리뷰 요약] 상품 리뷰를 JSON 형식으로 요약하기 위한 프롬프트입니다.
 */
export const createReviewSummaryPrompt = (productName: string, reviewsText: string): string => `
  [Reviews]
  ${reviewsText}
  [Request]
  Summarize the reviews of the product into pros and cons.
  And select the maximum three review sections that best reflect this content.
  Product name: ${productName}
  Answer should be following JSON format. Only three column : ("pros" : list, "cons" : list, "bests" : list)
  Make sure to include 3~5 pros, 2~3 cons, 1~3 best reviews.
  If each best review exceeds two sentences, "output only the most important TWO sentences" in that review.
  Use the Korean.
  [JSON answer]
`;
