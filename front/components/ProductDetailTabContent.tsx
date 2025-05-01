import React from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View as RNView
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { formatDate, formatTime } from '../utils/common';
import useColorScheme from '../hooks/useColorScheme';
import { Colors } from '@constants';
import { TABS } from '../utils/common';
import { Text, View } from '@components';
import { Request } from '../stores/request/types';
import { ProductDetailState } from '../stores/product/types';
import { LoadingStatus } from '../stores/product/atoms';
import { ScrapedProductDetail } from '../stores/product/types';
import { useAtomValue } from 'jotai';
import { productReviewAtom } from '../stores/product/atoms';
import { useState } from 'react';

import type { ColorScheme } from '@hooks';

interface TabContentProps {
    tab: TABS;
    productDetail: ProductDetailState | void;
    refs: Record<string, React.RefObject<RNView>>;
    question: string;
    setQuestion: React.Dispatch<React.SetStateAction<string>>;
    handleClickSend: (params: any) => void;
    request: Request | undefined;
    loadingMessages: Record<TABS | 'manager', string>;
    loadingStatus: { [key in TABS]: LoadingStatus };
    handleRegenerate: () => void;
    scrapedProductDetail: ScrapedProductDetail;
    handleLoadMore: () => void;
}

const TabContent: React.FC<TabContentProps> = ({
    tab,
    productDetail,
    refs,
    question,
    setQuestion,
    handleClickSend,
    request,
    loadingMessages,
    loadingStatus,
    handleRegenerate,
    scrapedProductDetail,
    handleLoadMore
}) => {
    const colorScheme = useColorScheme();
    const styles = useStyles(colorScheme);
    const markdownStyles = StyleSheet.create({
        text: {
            fontSize: 14,
            lineHeight: 20,
            color: Colors[colorScheme].text.primary
        }
    });
    const productReview = useAtomValue(productReviewAtom);
    const [regenerateCount, setRegenerateCount] = useState(0);

    if (tab === TABS.QUESTION) {
        return (
            <QuestionTab
                styles={styles}
                question={question}
                setQuestion={setQuestion}
                handleClickSend={handleClickSend}
                request={request}
                refs={refs}
                loadingMessages={loadingMessages}
                loadingStatus={loadingStatus}
                tab={tab}
                markdownStyles={markdownStyles}
                productDetail={productDetail}
            />
        );
    } else if (loadingStatus[tab] == 0) {
        return (
            <View style={styles.detailWrap}>
                <View style={styles.indicatorWrap} accessible accessibilityLabel={loadingMessages[tab]}>
                    <ActivityIndicator />
                    <Text>{loadingMessages[tab]}</Text>
                </View>
            </View>
        );
    } else if (loadingStatus[tab] == 1) {
        return (
            <View style={styles.detailWrap}>
                <View style={styles.indicatorWrap} accessible accessibilityLabel={loadingMessages[tab]}>
                    <ActivityIndicator />
                    <Text>{loadingMessages[tab]}</Text>
                </View>
            </View>
        );
    } else if (!!productDetail?.[tab]) {
        return tab !== 'review' ? (
            <View style={styles.detailWrap} ref={refs[tab]}>
                <Markdown style={markdownStyles}>{productDetail?.[tab]}</Markdown>
            </View>
        ) : (
            <ReviewTab
                styles={styles}
                productDetail={productDetail}
                refs={refs}
                markdownStyles={markdownStyles}
                tab={tab}
                handleLoadMore={handleLoadMore}
            />
        );
    } else if (regenerateCount < 3) {
        setTimeout(() => {
            setRegenerateCount(prev => prev + 1);
            handleRegenerate();
        }, 1000);
        return (
            <View style={styles.detailWrap}>
                <View style={styles.indicatorWrap} accessible accessibilityLabel={loadingMessages[tab]}>
                    <ActivityIndicator />
                    <Text>{loadingMessages[tab]}</Text>
                </View>
            </View>
        );
    } else {
        console.log('productDetail:', productDetail);
        return (
            <View style={styles.detailWrap}>
                <Text>정보를 불러오는데 실패했습니다.</Text>
                <Pressable
                    onPress={handleRegenerate}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="다시 생성하기"
                >
                    <Text>다시 생성하기</Text>
                </Pressable>
            </View>
        );
    }
};

interface QuestionTabProps {
    styles: ReturnType<typeof useStyles>;
    question: string;
    setQuestion: React.Dispatch<React.SetStateAction<string>>;
    handleClickSend: (parmas: any) => void;
    request: Request | undefined;
    refs: Record<string, React.RefObject<RNView>>;
    loadingMessages: Record<TABS | 'manager', string>;
    loadingStatus: { [key in TABS]: LoadingStatus };
    tab: TABS;
    markdownStyles: any;
    productDetail: ProductDetailState | void;
}

const QuestionTab: React.FC<QuestionTabProps> = ({
    styles,
    question,
    setQuestion,
    handleClickSend,
    request,
    refs,
    loadingMessages,
    loadingStatus,
    tab,
    markdownStyles,
    productDetail
}) => (
    <View style={styles.detailWrap}>
        <View style={styles.inputWrap}>
            <TextInput
                style={styles.textArea}
                underlineColorAndroid="transparent"
                value={question}
                returnKeyType="done"
                onSubmitEditing={() => {
                    console.log('onSubmitEditing - 질문 전송:', question);
                    handleClickSend(question);
                }}
                accessible
                accessibilityLabel="질문 입력창"
                onChangeText={text => {
                    console.log('onChangeText - 입력값:', text);
                    setQuestion(text);
                }}
                placeholder="상품에 대해 궁금한 점을 자유롭게 AI포미에게 물어보세요."
            />

            <Pressable
                onPress={() => {
                    console.log('Pressable - 질문 전송:', question);
                    handleClickSend(question);
                }}
                accessible
                accessibilityLabel="질문하기"
                accessibilityRole="button"
            >
                <Image style={styles.sendIcon} source={require('../assets/images/discover/downSquareArrow.png')} />
            </Pressable>
        </View>

        {loadingStatus[tab] === 1 ? (
            <View style={styles.indicatorWrap} accessible accessibilityLabel={loadingMessages[tab]}>
                <ActivityIndicator />
                <Text>{loadingMessages[tab]}</Text>
            </View>
        ) : loadingStatus[tab] === 2 ? (
            <View ref={refs[tab]}>
                <Markdown style={markdownStyles}>{`**AI 포미:** ${productDetail && productDetail.answer}`}</Markdown>
            </View>
        ) : null}

        {request ? (
            request.answer?.text ? (
                <>
                    <View style={styles.seperator}></View>
                    <View ref={refs.manager}>
                        <Text style={styles.boldText}>다음은 질문에 대한 매니저의 답변이에요.</Text>
                    </View>
                    <Markdown>{`**나의 질문:** ${request?.text}`}</Markdown>
                    <Markdown style={markdownStyles}>{`**픽포미 매니저:** ${request?.answer?.text}`}</Markdown>
                    <Text>{`${formatDate(request?.updatedAt)} ${formatTime(request?.updatedAt)}`}</Text>
                </>
            ) : (
                <>
                    <View style={styles.seperator}></View>
                    <View ref={refs.manager}>
                        <Text>{loadingMessages.manager}</Text>
                    </View>
                </>
            )
        ) : null}
    </View>
);

interface ReviewTabProps {
    styles: ReturnType<typeof useStyles>;
    productDetail: ProductDetailState;
    tab: TABS;
    refs: Record<string, React.RefObject<RNView>>;
    markdownStyles: any; // Replace 'any' with the correct type for markdownStyles
    handleLoadMore: () => void;
}

const ReviewTab: React.FC<ReviewTabProps> = ({ styles, productDetail, tab, refs, markdownStyles, handleLoadMore }) => {
    const review =
        productDetail && (productDetail[tab] as { pros: string[]; cons: string[]; bests: string[] } | undefined);

    return (
        <>
            {!review?.pros?.length && !review?.cons?.length ? (
                <View style={styles.detailWrap} ref={refs[tab]}>
                    <Text>리뷰정보를 찾을 수 없습니다.</Text>
                </View>
            ) : null}
            {review?.pros?.length !== 0 && (
                <View style={styles.detailWrap} ref={refs[tab]}>
                    <Text style={styles.reviewListTitle}>긍정적인 리뷰</Text>
                    <Markdown style={markdownStyles}>
                        {review?.pros.map((row: string, i: number) => `${i + 1}. ${row}`).join('\n')}
                    </Markdown>
                </View>
            )}
            {review?.cons?.length !== 0 && (
                <View style={styles.detailWrap}>
                    <Text style={styles.reviewListTitle}>부정적인 리뷰</Text>
                    <Markdown style={markdownStyles}>
                        {review?.cons.map((row: string, i: number) => `${i + 1}. ${row}`).join('\n')}
                    </Markdown>
                </View>
            )}
            {review?.bests?.length !== 0 && (
                <View style={styles.detailWrap}>
                    <Text style={styles.reviewListTitle}>베스트 리뷰</Text>
                    {review?.bests.map((row: string, i: number) => (
                        <Markdown style={markdownStyles} key={`product-detail-${tab}-bests-row-${i}`}>
                            {`**리뷰 ${i + 1}:** ${row}`}
                        </Markdown>
                    ))}
                </View>
            )}
            <TouchableOpacity onPress={handleLoadMore} style={styles.loadMoreButton}>
                <Text style={styles.loadMoreText}>더 많은 리뷰 불러오기</Text>
            </TouchableOpacity>
        </>
    );
};

const useStyles = (colorScheme: ColorScheme) =>
    StyleSheet.create({
        seperator: {
            width: '100%',
            backgroundColor: Colors[colorScheme].borderColor.primary,
            height: 1,
            marginVertical: 25
        },
        detailWrap: {
            padding: 28
        },
        reviewListTitle: {
            fontSize: 14,
            fontWeight: '700',
            marginBottom: 13
        },
        reviewListRow: {
            flexDirection: 'row'
        },
        reviewListRowText: {
            lineHeight: 24,
            fontSize: 14
        },
        indicatorWrap: {
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center'
        },
        inputWrap: {
            flex: 1,
            marginBottom: 16,
            paddingLeft: 12,
            paddingRight: 8,
            paddingVertical: 8,
            borderRadius: 8,
            height: 40,
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'white',
            borderColor: '#5F5F5F',
            borderWidth: 1,
            flexDirection: 'row'
        },
        textArea: {
            fontSize: 14,
            flex: 1,
            width: '100%'
        },
        sendIcon: {
            flexShrink: 0,
            marginLeft: 3,
            width: 26,
            height: 26,
            justifyContent: 'center',
            alignItems: 'center'
        },
        boldText: {
            fontWeight: '700'
        },
        loadMoreButton: {
            padding: 10,
            alignItems: 'center',
            justifyContent: 'center'
        },
        loadMoreText: {
            fontSize: 14,
            color: Colors[colorScheme].text.primary,
            textDecorationLine: 'underline'
        }
    });

export default TabContent;
