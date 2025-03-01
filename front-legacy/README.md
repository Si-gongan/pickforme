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
        
