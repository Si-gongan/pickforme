// 목적: 상품 리뷰를 수집하기 위한 웹뷰입니다.
// 기능:
// 쿠팡 상품 URL로부터 리뷰 페이지 URL을 추출하고 해당 페이지를 숨겨진 웹뷰로 불러옵니다.
// 웹 페이지에서 리뷰 내용을 추출하여 문자열 배열로 변환합니다.
// 스크롤 다운 기능을 제공하여 더 많은 리뷰를 로드할 수 있게 합니다.
// 중복 리뷰는 제거하고 새로운 리뷰만 누적하여 전달합니다.
// 특징: 스크롤 다운 시 새로운 리뷰를 감지하여 기존 리뷰와 합쳐서 전달하는 메커니즘이 있습니다.

import React, { useRef, useState, useEffect, ReactElement } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { View } from 'react-native';
import { convertToCoupangReviewUrl } from '@/utils/url';

interface WebViewProps {
    productUrl: string;
    onMessage: (data: string[]) => void;
}

// 반환 타입 정의
interface WebViewReviewsResult {
    component: ReactElement;
    scrollDown: () => void;
    runJavaScript: () => void;
}

export const useWebViewReviews = ({ productUrl, onMessage }: WebViewProps): WebViewReviewsResult => {
    const webViewRef = useRef<WebView>(null);
    const [reviewWebviewUrl, setReviewWebviewUrl] = useState<string>('');
    const [injectionCode, setInjectionCode] = useState<string>('');
    const [accumulatedReviews, setAccumulatedReviews] = useState<string[]>([]);
    const maxRetries = 5;
    let retryCount = 0;
    let scrollDownCount = 0;

    const parseUrl = async (url: string) => {
        try {
            if (url.includes('coupang')) {
                const reviewUrl = await convertToCoupangReviewUrl(url);
                setReviewWebviewUrl(reviewUrl);
                setInjectionCode(`(function() {
                  const divs = document.querySelectorAll('div[class*="review-content"]');
                  const divContents = [];
                  divs.forEach(div => {
                    divContents.push(div.innerText.trim());
                  });
                  const uniqueContents = Array.from(new Set(divContents));
                  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ content: uniqueContents }));
                  }
                })();
                true;`);
            } else {
                // TODO: add other platforms
                setReviewWebviewUrl(url);
                setInjectionCode(`(function() {
                  const divs = document.querySelectorAll('div[class*="review"]');
                  const divContents = [];
                  divs.forEach(div => {
                    if (div.innerText.length > 20) {
                      divContents.push(div.innerText.trim());
                    }
                  });
                  const uniqueContents = Array.from(new Set(divContents));
                  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ content: uniqueContents }));
                  }
                })();
                true;`);
            }
        } catch (error) {
            setReviewWebviewUrl(url);
        }
    };

    const runJavaScript = () => {
        setTimeout(() => {
            if (webViewRef.current) {
                webViewRef.current.injectJavaScript(injectionCode);
            }
        }, 1000);
    };

    const scrollDown = () => {
        if (webViewRef.current) {
            const scrollScript = `
                (function() {
                    const prevScrollY = window.scrollY;
                    window.scrollTo(0, document.body.scrollHeight);
                    
                    // 리뷰 컨텐츠 추출 코드 직접 실행
                    const divs = document.querySelectorAll('div[class*="review-content"]');
                    const divContents = [];
                    divs.forEach(div => {
                        divContents.push(div.innerText.trim());
                    });
                    const uniqueContents = Array.from(new Set(divContents));
                    
                    // 스크롤 결과와 컨텐츠를 함께 전송
                    setTimeout(function() {
                        const scrollChanged = window.scrollY > prevScrollY;
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'scrollResult',
                            scrollChanged: scrollChanged,
                            content: uniqueContents
                        }));
                    }, 1000);
                    return true;
                })();
            `;
            webViewRef.current.injectJavaScript(scrollScript);
        }
    };

    useEffect(() => {
        retryCount = 0;
        parseUrl(productUrl)
            .then(() => {
                runJavaScript();
            })
            .catch(error => {
                console.error('URL 파싱 중 오류:', error);
            });
    }, [productUrl]);

    const handleMessage = (event: WebViewMessageEvent) => {
        const data = event.nativeEvent.data;

        console.log('WebView message in webview-reviews:', data.length);

        try {
            const parsedData = JSON.parse(data);

            // 스크롤 결과 처리
            if (parsedData.type === 'scrollResult') {
                console.log('스크롤 결과:', parsedData.scrollChanged);

                if (!parsedData.scrollChanged && scrollDownCount < 11) {
                    scrollDown();
                    scrollDownCount++;
                    return;
                }

                // 스크롤 결과에 컨텐츠가 포함되어 있으면 처리
                if (parsedData.content && parsedData.content.length > 0) {
                    const newReviews = parsedData.content.filter(
                        (review: string) => !accumulatedReviews.includes(review)
                    );

                    if (newReviews.length > 0) {
                        console.log('새로운 리뷰:', newReviews.length, '개 발견');
                        const updatedReviews = [...accumulatedReviews, ...newReviews];
                        setAccumulatedReviews(updatedReviews);
                        onMessage(updatedReviews); // 전체 리뷰 전달
                    }
                }
                return;
            }

            // 일반 컨텐츠 처리
            if (parsedData.content && (parsedData.content.length > 0 || retryCount >= maxRetries)) {
                const newReviews = parsedData.content.filter((review: string) => !accumulatedReviews.includes(review));

                if (newReviews.length > 0) {
                    const updatedReviews = [...accumulatedReviews, ...newReviews];
                    setAccumulatedReviews(updatedReviews);
                    onMessage(updatedReviews); // 전체 리뷰 전달
                }
            } else {
                retryCount++;
                runJavaScript();
            }
        } catch (error) {
            console.error('Failed to parse JSON:', error);
        }
    };

    const handleError = (event: any) => {
        console.warn('WebView error:', event.nativeEvent);
    };

    const component = (
        <View style={{ width: '100%', height: 0 }}>
            <WebView
                ref={webViewRef}
                source={{ uri: reviewWebviewUrl }}
                onMessage={handleMessage}
                onLoadEnd={runJavaScript}
                onError={handleError}
                style={{ opacity: 0, height: 0 }} // 화면을 숨김
                cacheEnabled={false}
                cacheMode="LOAD_NO_CACHE"
                renderToHardwareTextureAndroid={true}
            />
        </View>
    );

    return { component, scrollDown, runJavaScript };
};
