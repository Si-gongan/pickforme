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

import type { ColorScheme } from '@hooks';

interface TabContentProps {
    tab: TABS;
    productDetail: ProductDetailState | void;
    refs: Record<string, React.RefObject<RNView>>;
    question: string;
    setQuestion: React.Dispatch<React.SetStateAction<string>>;
    handleClickSend: (params: any) => void;
    request: Request | undefined;
    productRequests: Request[]; // 추가된 현재 상품에 대한 모든 요청 배열
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
    productRequests,
    loadingMessages,
    loadingStatus,
    handleRegenerate,
    scrapedProductDetail,
    handleLoadMore
}) => {
    const colorScheme = useColorScheme();
    const styles = useStyles(colorScheme);
    const textStyle = { color: Colors[colorScheme].text.primary };
    const markdownStyles = StyleSheet.create({
        text: {
            fontSize: 14,
            lineHeight: 20,
            color: Colors[colorScheme].text.primary
        }
    });
    // 상품 리뷰 데이터는 현재 productDetail에 포함되어 있음.
    // const productReview = useAtomValue(productReviewAtom);
    // const [regenerateCount, setRegenerateCount] = useState(0);

    // 1. Question 탭 처리
    if (tab === TABS.QUESTION) {
        return (
            <QuestionTab
                styles={styles}
                question={question}
                setQuestion={setQuestion}
                handleClickSend={handleClickSend}
                request={request}
                productRequests={productRequests}
                refs={refs}
                loadingMessages={loadingMessages}
                loadingStatus={loadingStatus}
                tab={tab}
                markdownStyles={markdownStyles}
                productDetail={productDetail}
                colorScheme={colorScheme}
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
        if (tab === 'review') {
            return (
                <ReviewTab
                    styles={styles}
                    productDetail={productDetail}
                    refs={refs}
                    markdownStyles={markdownStyles}
                    tab={tab}
                    handleLoadMore={handleLoadMore}
                    colorScheme={colorScheme}
                />
            );
        }

        return (
            <View style={styles.detailWrap} ref={refs[tab]} accessibilityLabel={`${tab} 내용`}>
                <Markdown style={markdownStyles}>{productDetail?.[tab]}</Markdown>
            </View>
        );
    }

    // 4. 실패 상태
    return (
        <View style={styles.detailWrap}>
            <Text style={textStyle}>정보를 불러오는데 실패했습니다.</Text>
            <Pressable
                onPress={handleRegenerate}
                accessible
                accessibilityRole="button"
                accessibilityLabel="다시 생성하기"
            >
                <Text style={textStyle}>다시 생성하기</Text>
            </Pressable>
        </View>
    );
};

interface QuestionTabProps {
    styles: ReturnType<typeof useStyles>;
    question: string;
    setQuestion: (text: string) => void;
    handleClickSend: any;
    request: any; // 기존 호환성을 위해 유지
    productRequests: any[]; // 추가된 현재 상품에 대한 모든 요청 배열
    refs: Record<string, React.RefObject<RNView>>;
    loadingMessages: any;
    loadingStatus: any;
    tab: TABS;
    markdownStyles: any;
    productDetail: ProductDetailState | void;
    colorScheme: ColorScheme;
}

const QuestionTab: React.FC<QuestionTabProps> = ({
    styles,
    question,
    setQuestion,
    handleClickSend,
    request,
    productRequests,
    refs,
    loadingMessages,
    loadingStatus,
    tab,
    markdownStyles,
    productDetail,
    colorScheme
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
                placeholderTextColor={colorScheme === 'dark' ? '#aaaaaa' : '#888888'}
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
                <Text style={styles.loadingMessageText}>{loadingMessages[tab]}</Text>
            </View>
        ) : loadingStatus[tab] === 2 ? (
            <View ref={refs[tab]} accessible={true} accessibilityLabel={`AI 포미 답변: ${productDetail?.answer || ''}`}>
                <Markdown style={markdownStyles}>{`**AI 포미:** ${productDetail && productDetail.answer}`}</Markdown>
            </View>
        ) : null}

        {/* 전처리된 매니저 질문 응답 목록 표시 (최신순) */}
        {productRequests && productRequests.length > 0 ? (
            // 응답이 있는 질문들 표시
            <>
                <View style={styles.seperator}></View>
                <View ref={refs.manager} accessible={true} accessibilityLabel="매니저 답변">
                    <Text style={styles.boldText}>매니저 답변</Text>
                </View>

                <View style={styles.seperator}></View>
                {/* 최신순으로 정렬된 모든 질문과 답변 표시 */}
                {productRequests.map((req, index) => (
                    <View key={req._id || index} style={index > 0 ? { marginTop: 20 } : {}}>
                        {/* 날짜 - 스크린리더 순서 1 */}
                        <Text
                            style={{ color: Colors[colorScheme].text.primary, marginBottom: 5 }}
                            accessible={true}
                            accessibilityLabel={`질문 날짜: ${formatDate(req?.updatedAt)} ${formatTime(
                                req?.updatedAt
                            )}`}
                        >
                            {`${formatDate(req?.updatedAt)} ${formatTime(req?.updatedAt)}`}
                        </Text>

                        {/* 질문 - 스크린리더 순서 2 */}
                        <View accessible={true} accessibilityLabel={`나의 질문: ${req?.text || ''}`}>
                            <Markdown>{`**나의 질문:** ${req?.text || ''}`}</Markdown>
                        </View>

                        {/* 답변 표시 - 스크린리더 순서 3 */}
                        {req.answer?.text ? (
                            <View
                                accessible={true}
                                accessibilityLabel={`픽포미 매니저 답변: ${req?.answer?.text || ''}`}
                            >
                                <Markdown style={markdownStyles}>{`**픽포미 매니저:** ${
                                    req?.answer?.text || ''
                                }`}</Markdown>
                            </View>
                        ) : (
                            <View accessible={true} accessibilityLabel={loadingMessages.manager}>
                                <Text style={styles.loadingMessageText}>{loadingMessages.manager}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </>
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
    colorScheme: ColorScheme;
}

const ReviewTab: React.FC<ReviewTabProps> = ({
    styles,
    productDetail,
    tab,
    refs,
    markdownStyles,
    handleLoadMore,
    colorScheme
}) => {
    const review =
        productDetail && (productDetail[tab] as { pros: string[]; cons: string[]; bests: string[] } | undefined);

    return (
        <>
            {!review?.pros?.length && !review?.cons?.length ? (
                <View
                    style={styles.detailWrap}
                    ref={refs[tab]}
                    accessible={true}
                    accessibilityLabel="리뷰 정보를 찾을 수 없습니다."
                >
                    <Text style={{ color: Colors[colorScheme].text.primary }}>리뷰정보를 찾을 수 없습니다.</Text>
                </View>
            ) : null}
            {review?.pros?.length !== 0 && (
                <View
                    style={styles.detailWrap}
                    ref={refs[tab]}
                    accessible={true}
                    accessibilityLabel={`긍정적인 리뷰: ${review?.pros.map((row, i) => `${i + 1}. ${row}`).join(', ')}`}
                >
                    <Text style={styles.reviewListTitle}>긍정적인 리뷰</Text>
                    <Markdown style={markdownStyles}>
                        {review?.pros.map((row: string, i: number) => `${i + 1}. ${row}`).join('\n')}
                    </Markdown>
                </View>
            )}
            {review?.cons?.length !== 0 && (
                <View
                    style={styles.detailWrap}
                    ref={refs[tab]}
                    accessible={true}
                    accessibilityLabel={`부정적인 리뷰: ${review?.cons.map((row, i) => `${i + 1}. ${row}`).join(', ')}`}
                >
                    <Text style={styles.reviewListTitle}>부정적인 리뷰</Text>
                    <Markdown style={markdownStyles}>
                        {review?.cons.map((row: string, i: number) => `${i + 1}. ${row}`).join('\n')}
                    </Markdown>
                </View>
            )}
            {review?.bests?.length !== 0 && (
                <View
                    style={styles.detailWrap}
                    ref={refs[tab]}
                    accessible={true}
                    accessibilityLabel={`베스트 리뷰: ${review?.bests.map((row, i) => `${i + 1}. ${row}`).join(', ')}`}
                >
                    <Text style={styles.reviewListTitle}>베스트 리뷰</Text>
                    {review?.bests.map((row: string, i: number) => (
                        <Markdown style={markdownStyles} key={`product-detail-${tab}-bests-row-${i}`}>
                            {`**리뷰 ${i + 1}:** ${row}`}
                        </Markdown>
                    ))}
                </View>
            )}
            {/* <TouchableOpacity
                onPress={handleLoadMore}
                style={styles.loadMoreButton}
                accessible
                accessibilityLabel="더 많은 리뷰 불러오기"
            >
                <Text style={styles.loadMoreText}>더 많은 리뷰 불러오기</Text>
            </TouchableOpacity> */}
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
            marginBottom: 13,
            color: Colors[colorScheme].text.primary
        },
        reviewListRow: {
            flexDirection: 'row'
        },
        reviewListRowText: {
            lineHeight: 24,
            fontSize: 14,
            color: Colors[colorScheme].text.primary
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
            backgroundColor: Colors[colorScheme].background.secondary,
            borderColor: Colors[colorScheme].border.third,
            borderWidth: 1,
            flexDirection: 'row'
        },
        textArea: {
            fontSize: 14,
            flex: 1,
            width: '100%',
            color: Colors[colorScheme].text.primary
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
            fontWeight: '700',
            color: Colors[colorScheme].text.primary
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
        },
        loadingMessageText: {
            fontSize: 14,
            color: Colors[colorScheme].text.primary
        }
    });

export default TabContent;
