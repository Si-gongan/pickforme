import React, { useRef, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    TextInput,
    View as RNView,
    findNodeHandle,
    AccessibilityInfo,
    Keyboard
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
import { productDetailAtom } from '../stores/product/atoms';
import { useAtomValue } from 'jotai';

import type { ColorScheme } from '@hooks';

interface TabContentProps {
    tab: TABS;
    refs: Record<string, React.RefObject<RNView | null>>;
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

    const productDetail = useAtomValue(productDetailAtom);
    // 상품 리뷰 데이터는 현재 productDetail에 포함되어 있음.
    // const productReview = useAtomValue(productReviewAtom);
    // const [regenerateCount, setRegenerateCount] = useState(0);
    const [isTabPressed, setIsTabPressed] = useState(false);

    useEffect(() => {
        if (tab !== TABS.CAPTION) {
            setIsTabPressed(true);
        }
    }, [tab]);

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

        // CAPTION 탭
        const DefaultTabContent = () => {
            // 로컬 ref 생성
            const contentRef = useRef<RNView>(null);

            useEffect(() => {
                if (contentRef.current && isTabPressed) {
                    const node = findNodeHandle(contentRef.current);
                    if (node) {
                        setTimeout(() => {
                            AccessibilityInfo.setAccessibilityFocus(node);
                        }, 1000);
                    }
                }
            }, [tab, contentRef.current, isTabPressed]);

            return (
                <View style={styles.detailWrap} ref={contentRef} accessibilityLabel={`${tab} 내용`}>
                    <Markdown style={markdownStyles}>{productDetail?.[tab]}</Markdown>
                </View>
            );
        };

        return <DefaultTabContent />;
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
    refs: Record<string, React.RefObject<RNView | null>>;
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
}) => {
    // 질문 탭의 메인 컨테이너에 대한 ref
    const contentRef = useRef<RNView>(null);

    // ref가 설정되면 부모에게 알림
    useEffect(() => {
        if (contentRef.current) {
            const node = findNodeHandle(contentRef.current);
            if (node) {
                setTimeout(() => {
                    AccessibilityInfo.setAccessibilityFocus(node);
                }, 1000);
            }
        }
    }, [tab, contentRef.current]);

    return (
        <View style={styles.detailWrap} ref={contentRef}>
            <View style={styles.inputWrap}>
                <TextInput
                    style={styles.textArea}
                    underlineColorAndroid="transparent"
                    value={question}
                    returnKeyType="done"
                    onSubmitEditing={() => {
                        handleClickSend(question);
                    }}
                    accessible
                    accessibilityLabel="질문 입력창. 텍스트 필드. 상품에 대해 궁금한 점을 자유롭게 AI 포미에게 물어보세요. 예를 들어, 이 상품의 단백질 함량은 몇그램 인가요? 라고 물어볼 수 있어요."
                    onChangeText={text => {
                        setQuestion(text);
                    }}
                    placeholder="상품에 대해 궁금한 점을 자유롭게 AI포미에게 물어보세요."
                    placeholderTextColor={colorScheme === 'dark' ? '#aaaaaa' : '#888888'}
                />

                <Pressable
                    onPress={() => {
                        console.log('press question to AI onPress');
                        if (question.trim()) {
                            handleClickSend(question);
                        }
                    }}
                    accessible
                    accessibilityLabel="질문하기"
                    accessibilityRole="button"
                    onAccessibilityTap={() => {
                        console.log('VoiceOver focus detected - accessibility tap triggered');
                        Keyboard.dismiss();
                        if (question.trim()) {
                            handleClickSend(question);
                        }
                    }}
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
                <View accessible={true} accessibilityLabel={`AI 포미 답변: ${productDetail?.answer || ''}`}>
                    <Markdown style={markdownStyles}>{`**AI 포미:** ${
                        productDetail && productDetail.answer
                    }`}</Markdown>
                </View>
            ) : null}

            {/* 전처리된 매니저 질문 응답 목록 표시 (최신순) */}
            {productRequests && productRequests.length > 0 ? (
                // 응답이 있는 질문들 표시
                <>
                    <View style={styles.seperator}></View>
                    <View accessible={true} accessibilityLabel="매니저 답변">
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
                                <Markdown style={markdownStyles}>{`**나의 질문:** ${req?.text || ''}`}</Markdown>
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
};

interface ReviewTabProps {
    styles: ReturnType<typeof useStyles>;
    productDetail: ProductDetailState;
    tab: TABS;
    refs: Record<string, React.RefObject<RNView | null>>;
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
    // 리뷰 탭의 메인 컨테이너에 대한 ref
    const contentRef = useRef<RNView>(null);

    useEffect(() => {
        if (contentRef.current) {
            const node = findNodeHandle(contentRef.current);
            if (node) {
                setTimeout(() => {
                    AccessibilityInfo.setAccessibilityFocus(node);
                }, 1000);
            }
        }
    }, [tab, contentRef.current]);
    const review =
        productDetail && (productDetail[tab] as { pros: string[]; cons: string[]; bests: string[] } | undefined);

    return (
        <>
            {/* {!review?.pros?.length && !review?.cons?.length ? (
                <View
                    style={[
                        styles.detailWrap,
                        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }
                    ]}
                    accessible={true}
                    accessibilityLabel="리뷰 로딩 중"
                >
                    <ActivityIndicator />
                    <Text style={styles.loadingMessageText}>리뷰 요약 중 입니다.</Text>
                </View>
            ) : null} */}
            {review?.pros?.length !== 0 && (
                <View style={styles.detailWrap} ref={contentRef}>
                    <Text
                        style={styles.reviewListTitle}
                        accessible={true}
                        accessibilityRole="header"
                        accessibilityLabel="긍정적인 리뷰"
                    >
                        긍정적인 리뷰
                    </Text>
                    {review?.pros.map((row: string, i: number) => (
                        <View key={`positive-review-${i}`} accessible={true} accessibilityLabel={`${i + 1}. ${row}`}>
                            <Markdown style={markdownStyles}>{`${i + 1}. ${row}`}</Markdown>
                        </View>
                    ))}
                </View>
            )}
            {review?.cons?.length !== 0 && (
                <View style={styles.detailWrap}>
                    <Text
                        style={styles.reviewListTitle}
                        accessible={true}
                        accessibilityRole="header"
                        accessibilityLabel="부정적인 리뷰"
                    >
                        부정적인 리뷰
                    </Text>
                    {review?.cons.map((row: string, i: number) => (
                        <View key={`negative-review-${i}`} accessible={true} accessibilityLabel={`${i + 1}. ${row}`}>
                            <Markdown style={markdownStyles}>{`${i + 1}. ${row}`}</Markdown>
                        </View>
                    ))}
                </View>
            )}
            {review?.bests?.length !== 0 && (
                <View style={styles.detailWrap}>
                    <Text
                        style={styles.reviewListTitle}
                        accessible={true}
                        accessibilityRole="header"
                        accessibilityLabel="베스트 리뷰"
                    >
                        베스트 리뷰
                    </Text>
                    {review?.bests.map((row: string, i: number) => (
                        <View key={`best-review-${i}`} accessible={true} accessibilityLabel={`리뷰 ${i + 1}: ${row}`}>
                            <Markdown style={markdownStyles}>{`**리뷰 ${i + 1}:** ${row}`}</Markdown>
                        </View>
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
