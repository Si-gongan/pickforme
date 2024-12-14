# React Native (Expo) 로컬 실행 및 빌드

This project is a React Native application bootstrapped with Expo.

## Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

## Getting Started

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Si-gongan/pickforme.git
    cd pickforme/front
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Install Expo CLI globally if you haven't already:
    ```bash
    npm install -g expo-cli
    ```

### Running the Project

You can run the project on different platforms using the following npm scripts:

- Start the Expo development server:
    ```bash
    npm run dev
    ```

- Run the project on an Android device/emulator:
    ```bash
    npm run android
    ```

- Run the project on an iOS device/simulator:
    ```bash
    npm run ios
    ```

### Building the Project

To build the project for production, use the following commands:

- Build for iOS:
    ```bash
    npm run build:ios
    ```

- Build for Android:
    ```bash
    npm run build:android
    ```

### 빌드 제출
- iOS
  1. Xcode에서 직접 빌드 후 archive 전송
  2. ipa 직접 다운로드 후 Mac에서 transporter (MacApp) 이용해 appstore connect 직접 업로드
  3. `eas submit -p ios` 이용
- Android
  1. appbundle 직접 다운로드 후 google play console에 직접 업로드
  2. `eas build -p android` 이용

### 빌드 버전 수정
- app.json
  ```bash
  {
    "expo": {
      "version": "3.0.0", // 배포 버전 넘버
      ...,
      "ios": {
        ...,
        "buildNumber": "1" // iOS 빌드 넘버
      },
      "android": {
        ...,
        "versionCode": 1 // android 버전 코드
      }
  }
  ```
- 수정 후 꼭 `npx expo prebuild`를 진행해주어야 반영됨

### 2024.12.14 Update
- 안드로이드 플레이스토어 규정으로 인한 안드로이드 targetSdkVersion 34 이상이어야 함으로 종속성 버전 업데이트 진행
- 빌드는 expo 안드로이드 빌드 후 소스파일을 아래와 같이 수정
- 이에 따른 네이티브 코드 수정 소요 발생
  ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
  ./android/app/src/main/AndroidManifest.xml
  에서
  manifest 태그에
  xmlns:tools="http://schemas.android.com/tools" 추가하고
  application 태그에
  android:appComponentFactory="androidx.core.app.CoreComponentFactory"
  tools:replace="android:appComponentFactory"
  추가해야함
  ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
  ./android/gradle.properties
  하단에
  android.enableJetifier=true
  추가해야함
  ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
- eas 빌드

- ios dev 빌드시 back dev server url http 임으로
  app.json ios 부분에
  "infoPlist": {
    "NSAppTransportSecurity": {
      "NSAllowsArbitraryLoads": true
    }
  },
  삽입해야함

### 진행도
- 실결제 테스트 진행(결제 에러 컨트롤 필요)

### NOTICE
- 기본적으로 xCode, 안드로이드 스튜디오 설치 후 작업하시는걸 추천드리고
  expo 에서 pod 설치시 gem 을 이용하니 루비 및 기타 툴들 설치해서 사용하시면됩니다.
  종속성 최적화는 빌드 가능 및 기본 기능 구현은 확인완료했으며 결제 부분만 테스트하여 수정하면됩니다.

- React-native, expo, kotlin(그래들관리), xCode 등에 대한 지식이 필요합니다.(종속성 최적화 부분)

- 반드시 빌드 후 위 사항 수정하시고 eas 빌드하시기 바랍니다.
