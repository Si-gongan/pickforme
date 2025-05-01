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
   - `.env` 파일을 `env.example`에 맞게 업데이트
     (노션 픽포미 개발문서 > .env의 production env로 교체)

2. 스크립트 실행
```bash
npm run membership-events
```

⚠️ 주의사항: 스크립트 실행 후에는 반드시 local .env로 다시 변경해주세요!