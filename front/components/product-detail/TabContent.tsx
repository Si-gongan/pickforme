import React, { useRef, useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, AccessibilityInfo, findNodeHandle, View } from 'react-native';
import type { View as RNView } from 'react-native';
import { useAtomValue } from 'jotai';
import { productDetailAtom, LoadingStatus } from '../../stores/product/atoms';
import { TABS, loadingMessages } from '../../utils/common';
import { Text } from '@components';
import { Request } from '../../stores/request/types';
import useColorScheme from '../../hooks/useColorScheme';
import { Colors } from '@constants';

import CaptionTab from './tabs/CaptionTab';
import ReportTab from './tabs/ReportTab';
import ReviewTab from './tabs/ReviewTab';
import QuestionTab from './tabs/QuestionTab';

interface TabContentProps {
    tab: TABS;
    question: string;
    setQuestion: React.Dispatch<React.SetStateAction<string>>;
    handleClickSend: (params: any) => void;
    request: Request | undefined;
    productRequests: Request[];
    loadingStatus: { [key in TABS]: LoadingStatus };
    handleRegenerate: () => void;
    handleLoadMore: () => void;
    isTabPressed: boolean;
}

const NO_DATA_MESSAGE = {
    [TABS.CAPTION]: '이미지를 불러오는데 실패했습니다.',
    [TABS.REPORT]: '상세페이지 정보를 불러오는데 실패했습니다.',
    [TABS.REVIEW]: '리뷰 정보를 불러오는데 실패했습니다.'
};

const ERROR_MESSAGE = {
    [TABS.CAPTION]: '이미지 설명을 생성하는데 실패했습니다.',
    [TABS.REPORT]: '상세페이지 설명을 생성하는데 실패했습니다.',
    [TABS.REVIEW]: '리뷰 요약을 생성하는데 실패했습니다.'
};

const TabContent: React.FC<TabContentProps> = ({
    tab,
    question,
    setQuestion,
    handleClickSend,
    request,
    productRequests,
    loadingStatus,
    handleRegenerate,
    handleLoadMore,
    isTabPressed
}) => {
    const colorScheme = useColorScheme();
    const styles = useStyles(colorScheme);
    const productDetail = useAtomValue(productDetailAtom);

    // NO_DATA 메시지 ref
    const noDataRef = useRef<RNView>(null);

    // 탭이 바뀌거나, loading 상태가 바뀌었을때 -> 해당 탭의 상태가 NO_DATA면 포커스 이동.
    useEffect(() => {
        if (loadingStatus[tab] === LoadingStatus.NO_DATA && noDataRef.current) {
            const node = findNodeHandle(noDataRef.current);
            if (node) {
                setTimeout(() => {
                    AccessibilityInfo.setAccessibilityFocus(node);
                }, 500);
            }
        }
    }, [loadingStatus[tab], tab]);

    // 1. Question 탭 처리
    if (tab === TABS.QUESTION) {
        return (
            <QuestionTab
                question={question}
                setQuestion={setQuestion}
                handleClickSend={handleClickSend}
                productRequests={productRequests}
                loadingMessages={loadingMessages}
                loadingStatus={loadingStatus}
                tab={tab}
                productDetail={productDetail}
                isTabPressed={isTabPressed}
                request={request}
            />
        );
    }

    // 2. 로딩 상태 처리
    if (loadingStatus[tab] === 0 || loadingStatus[tab] === 1) {
        return (
            <View style={styles.detailWrap}>
                <View style={styles.indicatorWrap} accessible accessibilityLabel={loadingMessages[tab]}>
                    <ActivityIndicator />
                    <Text style={styles.loadingMessageText}>{loadingMessages[tab]}</Text>
                </View>
            </View>
        );
    }

    // 3. 상품 상세 정보가 있는 경우
    if (productDetail?.[tab]) {
        switch (tab) {
            case TABS.REVIEW:
                return (
                    <ReviewTab
                        productDetail={productDetail}
                        isTabPressed={isTabPressed}
                        handleLoadMore={handleLoadMore}
                    />
                );
            case TABS.REPORT:
                return <ReportTab productDetail={productDetail} isTabPressed={isTabPressed} />;
            case TABS.CAPTION:
            default:
                return <CaptionTab productDetail={productDetail} isTabPressed={isTabPressed} />;
        }
    }

    // 웹뷰, 서버 크롤링 모두 실패한 경우.
    if (loadingStatus[tab] === LoadingStatus.NO_DATA) {
        return (
            <View style={styles.detailWrap} ref={noDataRef} accessible accessibilityLabel={NO_DATA_MESSAGE[tab]}>
                <Text style={styles.errorText}>{NO_DATA_MESSAGE[tab]}</Text>
            </View>
        );
    }

    // 4. 실패 상태
    return (
        <View style={styles.detailWrap}>
            <Text style={styles.errorText}>{ERROR_MESSAGE[tab]}</Text>
            <Pressable
                onPress={handleRegenerate}
                accessible
                accessibilityRole="button"
                accessibilityLabel="다시 생성하기"
                style={styles.retryButton}
            >
                <Text style={styles.retryText}>다시 생성하기</Text>
            </Pressable>
        </View>
    );
};

const useStyles = (colorScheme: 'light' | 'dark') =>
    StyleSheet.create({
        detailWrap: {
            padding: 28
        },
        indicatorWrap: {
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center'
        },
        loadingMessageText: {
            fontSize: 14,
            color: Colors[colorScheme].text.primary
        },
        errorText: {
            fontSize: 14,
            color: Colors[colorScheme].text.primary,
            marginBottom: 16
        },
        retryButton: {
            padding: 12,
            backgroundColor: Colors[colorScheme].background.secondary,
            borderRadius: 8,
            alignItems: 'center'
        },
        retryText: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors[colorScheme].text.primary
        }
    });

export default TabContent;
