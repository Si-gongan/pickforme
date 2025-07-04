import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useAtomValue } from 'jotai';
import { productDetailAtom, LoadingStatus } from '../../stores/product/atoms';
import { TABS, loadingMessages } from '../../utils/common';
import { Text, View } from '@components';
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

    // 4. 실패 상태
    return (
        <View style={styles.detailWrap}>
            <Text style={styles.errorText}>정보를 불러오는데 실패했습니다.</Text>
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
