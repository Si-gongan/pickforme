import { GetPopupAPI, SetPopupAPI } from '@/stores';

export const PopupService = {
    async checkPopup(popupId: string) {
        try {
            const res = await GetPopupAPI();
            const flag = res.data?.find(p => p.popup_id === popupId);
            return !!flag;
        } catch (error) {
            console.error('팝업 데이터 로딩 실패:', error);
            return false;
        }
    },

    async checkHansiryunPopup() {
        return this.checkPopup('event_hansiryun');
    },

    async checkSurveyPopup() {
        return this.checkPopup('event_survey');
    },

    async setDontShowSurvey() {
        try {
            const payload = { popup_id: 'event_survey', flag: 1 };
            const res = await SetPopupAPI(payload);
            return res.status === 200;
        } catch (error) {
            console.error('설문조사 팝업 설정 실패:', error);
            return false;
        }
    }
};
