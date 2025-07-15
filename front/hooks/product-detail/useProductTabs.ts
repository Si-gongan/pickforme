import { useState, useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { TABS } from '../../utils/common';
import { getProductCaptionAtom, getProductReportAtom, getProductReviewAtom } from '../../stores/product/atoms';

export const useProductTabs = () => {
    const [tab, setTab] = useState<TABS>(TABS.CAPTION);
    const [isTabPressed, setIsTabPressed] = useState(false);

    const getProductCaption = useSetAtom(getProductCaptionAtom);
    const getProductReport = useSetAtom(getProductReportAtom);
    const getProductReview = useSetAtom(getProductReviewAtom);

    const handlePressTab = useCallback((nextTab: TABS) => {
        // 어떤 탭이든 클릭하면 true로 설정
        setIsTabPressed(true);
        setTab(nextTab);
    }, []);

    const handleRegenerate = useCallback(() => {
        if (tab === TABS.REPORT) getProductReport();
        if (tab === TABS.REVIEW) getProductReview();
        if (tab === TABS.CAPTION) getProductCaption();
    }, [tab, getProductReport, getProductReview, getProductCaption]);

    return {
        tab,
        isTabPressed,
        handlePressTab,
        handleRegenerate
    };
};
