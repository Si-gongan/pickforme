import {
    getAnalytics,
    logEvent as firebaseLogEvent,
    setUserProperty,
    logScreenView as firebaseLogScreenView
} from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';
import { AnalyticsEventName, AnalyticsScreenName, AnalyticsEventParams } from '../types/firebase';

// Analytics 인스턴스
const app = getApp();
console.log(app);

const analytics = getAnalytics(app);

// 이벤트 로깅
export const logEvent = async (eventName: AnalyticsEventName, params?: AnalyticsEventParams) => {
    try {
        await firebaseLogEvent(analytics, eventName, params);
    } catch (error) {
        console.error('Analytics event logging failed:', error);
    }
};

// 화면 추적
export const logScreenView = async (screenName: AnalyticsScreenName, screenClass: string) => {
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
    try {
        for (const [key, value] of Object.entries(properties)) {
            await setUserProperty(analytics, key, value);
        }
    } catch (error) {
        console.error('Setting user properties failed:', error);
    }
};
