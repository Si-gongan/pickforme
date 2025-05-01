## Backend
### Installation
```bash
cd back
npm install
```

### Run server
- Dev
```bash
npm run dev
```
- Prod
```bash
npm start
```

- PM2
```bash
npm run pm2
or
pm2 run pm2.json
```


### 이벤트 멤버십 스크립트 실행
한시련 이벤트 신청자 멤버십 처리를 위한 스크립트 실행 방법:

1. 준비사항
   - `back` 폴더에 `google_api_credentials.json` 파일 추가
     (노션 픽포미 개발문서 > .env 파일 참고)
   - `.env` 파일을 production용 .env로 교체
     (노션 픽포미 개발문서 > .env의 production env로 교체)

2. 스크립트 실행
```bash
npm run membership-events
```

⚠️ 주의사항: 
1. 스크립트 실행 후에는 반드시 local용 .env로 다시 변경해주세요!
2. 한시련 이벤트 번호(1번)나 지급 포인트(30, 9999)가 변경될 경우, 
   utils/events.ts 스크립트 내의 `EVENT_PRODUCT_REWARDS` 객체 값도 수정해야 합니다.