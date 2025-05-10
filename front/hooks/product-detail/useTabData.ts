// hooks/useTabData.ts
import { useSetAtom } from 'jotai';
import { sendLogAtom } from '@/stores/log/atoms';
import { getProductCaptionAtom, getProductReportAtom, getProductReviewAtom } from '@/stores/product/atoms';
import { TABS } from '@/utils/common';
import { ProductDetailState, ProductReview } from '@/stores/product/types';
import { useEffect } from 'react';
import { LoadingStatus } from '@/stores/product/atoms';

interface UseTabDataProps {
    tab: TABS;
    productDetail: ProductDetailState | void;
    productReview: string[];
    productUrl: string;
    loadingStatus: {
        caption: LoadingStatus;
        review: LoadingStatus;
        report: LoadingStatus;
        question: LoadingStatus;
    };
}

export const useTabData = ({ tab, productDetail, productReview, productUrl, loadingStatus }: UseTabDataProps) => {
    const getProductCaption = useSetAtom(getProductCaptionAtom);
    const getProductReport = useSetAtom(getProductReportAtom);
    const getProductReview = useSetAtom(getProductReviewAtom);
    const sendLog = useSetAtom(sendLogAtom);

    // 각 탭별로 필요한 데이터를 체크하는 함수
    const checkRequiredData = (tab: TABS, productDetail: ProductDetailState | void): boolean => {
        if (!productDetail) return false;

        if (productDetail && productDetail.product) {
            console.log('product', Object.keys(productDetail.product));
        }

        switch (tab) {
            case TABS.CAPTION:
                return !!(productDetail.product?.name && productDetail.product?.thumbnail);
            case TABS.REPORT:
                return !!(
                    productDetail.product?.name &&
                    productDetail.product?.detail_images &&
                    productDetail.product.detail_images.length > 0
                );
            case TABS.REVIEW:
                return productReview.length > 0;
            case TABS.QUESTION:
                return !!productDetail.product?.name;
            default:
                return false;
        }
    };

    // 각 탭별로 데이터가 있는지 체크하는 함수
    const hasTabData = (tab: TABS, productDetail: ProductDetailState | void): boolean => {
        if (!productDetail) return false;

        switch (tab) {
            case TABS.CAPTION:
                return !!productDetail.caption;
            case TABS.REPORT:
                return !!productDetail.report;
            case TABS.REVIEW:
                return !!productDetail.review;
            case TABS.QUESTION:
                return true;
            default:
                return false;
        }
    };

    // 각 탭별 API 호출 함수
    const callTabAPI = (tab: TABS) => {
        if (tab === TABS.QUESTION) {
            console.log('question 탭 호출');
            return;
        }

        // 이미 데이터를 가져오고 있다 -> 그러면 중복호출임.
        // 데이터를 가져오는데 실패했다 -> handleRegenerate를 통해서 유저가 수동으로 호출해야 함.
        // 데이터를 가져오는데 성공했다. 그러면 또 가져올 필요가 없음.
        if (loadingStatus[tab] !== LoadingStatus.INIT) {
            console.log(`${tab} 탭이 초기화 상태가 아닙니다. 현재상태 - ${LoadingStatus[loadingStatus[tab]]}`);

            return;
        }

        if (hasTabData(tab, productDetail)) {
            console.log(`${tab} 탭의 데이터가 이미 존재합니다.`);
            return;
        }

        if (!checkRequiredData(tab, productDetail)) {
            console.log(`${tab} 탭에 필요한 데이터가 없습니다.`);
            return;
        }

        switch (tab) {
            case TABS.CAPTION:
                sendLog({ product: { url: productUrl }, action: 'caption', metaData: {} });
                getProductCaption();
                break;
            case TABS.REPORT:
                sendLog({ product: { url: productUrl }, action: 'report', metaData: {} });
                getProductReport();
                break;
            case TABS.REVIEW:
                sendLog({ product: { url: productUrl }, action: 'review', metaData: {} });
                getProductReview();
                break;
        }
    };

    // productDetail이 변경될 때마다 현재 탭의 API 호출 여부 체크
    useEffect(() => {
        if (productDetail) {
            callTabAPI(tab);
        }
    }, [productDetail, tab, loadingStatus, productReview]);

    return {
        checkRequiredData,
        hasTabData
    };
};
