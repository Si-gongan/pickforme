import React, { useRef, useState, useEffect, ReactElement } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { View } from 'react-native';

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

    const parseUrl = (url: string) => {
        if (url.includes('coupang')) {
            let coupang_id;
            if (url.includes('link.coupang.com/re')) {
                coupang_id = parseInt(url.split('pageKey=')[1].split('&')[0]);
            } else if (url.includes('coupang.com/vp/products') || url.includes('coupang.com/vm/products')) {
                coupang_id = parseInt(url.split('products/')[1].split('?')[0]);
            }
            setReviewWebviewUrl(`https://m.coupang.com/vm/products/${coupang_id}/brand-sdp/reviews/detail`);
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
    };

    const runJavaScript = () => {
        setTimeout(() => {
            if (webViewRef.current) {
                webViewRef.current.injectJavaScript(injectionCode);
            }
        }, 1000);
    };

    const scrollDown = () => {
        console.log('스크롤 다운');
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
        parseUrl(productUrl);
        runJavaScript();
    }, [productUrl]);

    const handleMessage = (event: WebViewMessageEvent) => {
        const data = event.nativeEvent.data;

        console.log('WebView message in webview-reviews:', data.length);

        try {
            const parsedData = JSON.parse(data);

            // 스크롤 결과 처리
            if (parsedData.type === 'scrollResult') {
                console.log('스크롤 결과:', parsedData.scrollChanged);

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
