import {
    getAnalytics,
    logEvent as firebaseLogEvent,
    setUserProperty,
    logScreenView as firebaseLogScreenView,
    setAnalyticsCollectionEnabled,
    FirebaseAnalyticsTypes
} from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';
import { AnalyticsEventName, AnalyticsScreenName, AnalyticsEventParams } from '../types/firebase';

// Analytics 인스턴스
const app = getApp();
const isProd = process.env.EXPO_PUBLIC_APP_ENV === 'production';

let analytics: FirebaseAnalyticsTypes.Module;

// 프로덕션이 아닌 경우 Analytics 비활성화
if (!isProd) {
    console.log('🚫 Firebase Analytics disabled (not production)');
} else {
    analytics = getAnalytics(app);
    setAnalyticsCollectionEnabled(analytics, true); // 명시적으로 활성화
    console.log('✅ Firebase Analytics enabled (production)');
}

// 이벤트 로깅
export const logEvent = async (eventName: AnalyticsEventName, params?: AnalyticsEventParams) => {
    if (!isProd || !analytics) return;

    try {
        await firebaseLogEvent(analytics, eventName, params);
    } catch (error) {
        console.error('Analytics event logging failed:', error);
    }
};

// 화면 추적
export const logScreenView = async (screenName: AnalyticsScreenName, screenClass: string) => {
    if (!isProd || !analytics) return;

    try {
        await firebaseLogScreenView(analytics, {
            screen_name: screenName,
            screen_class: screenClass
        });
    } catch (error) {
        console.error('Screen view logging failed:', error);
    }
};

// 사용자 속성 설정
export const setUserProperties = async (properties: { [key: string]: string }) => {
    if (!isProd || !analytics) return;

    try {
        for (const [key, value] of Object.entries(properties)) {
            await setUserProperty(analytics, key, value);
        }
    } catch (error) {
        console.error('Setting user properties failed:', error);
    }
};
