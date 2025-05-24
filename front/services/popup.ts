import { GetPopupAPI } from '@/stores';

export const PopupService = {
    async checkHansiryunPopup() {
        try {
            const res = await GetPopupAPI();
            const flag = res.data?.find(p => p.popup_id === 'event_hansiryun');
            return !!flag;
        } catch (error) {
            console.error('팝업 데이터 로딩 실패:', error);
            return false;
        }
    }
};
