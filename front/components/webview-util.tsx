import React, { useRef, useState, useEffect, ReactElement } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { View } from 'react-native';

type WebViewType = 'images' | 'reviews';

interface WebViewProps {
    productUrl: string;
    type: WebViewType;
    onMessage: (data: string[]) => void;
}

export const useWebView = ({ productUrl, type, onMessage }: WebViewProps): ReactElement => {
    const webViewRef = useRef<WebView>(null);
    const [imageWebviewUrl, setImageWebviewUrl] = useState<string>('');
    const [reviewWebviewUrl, setReviewWebviewUrl] = useState<string>('');
    const [injectionCode, setInjectionCode] = useState<string>('');
    const maxRetries = 5;
    let retryCount = 0;

    const parseUrl = (url: string) => {
        console.log('parseUrl 시작:', { url, type });
        if (url.includes('coupang')) {
            let coupang_id;
            if (url.includes('link.coupang.com/re')) {
                coupang_id = parseInt(url.split('pageKey=')[1].split('&')[0]);
            } else if (url.includes('coupang.com/vp/products')) {
                coupang_id = parseInt(url.split('products/')[1].split('?')[0]);
            }
            console.log('쿠팡 상품 ID:', coupang_id);
            const imageUrl = `https://m.coupang.com/vm/products/${coupang_id}`;
            const reviewUrl = `https://m.coupang.com/vm/products/${coupang_id}/brand-sdp/reviews/detail`;
            console.log('WebView URL 설정:', { type, imageUrl, reviewUrl });
            setImageWebviewUrl(imageUrl);
            setReviewWebviewUrl(reviewUrl);
            if (type === 'images') {
                setInjectionCode(`(function() {
                    const elements = document.querySelectorAll('.subType-IMAGE, .subType-TEXT');
                    const urls = [];
                    elements.forEach(element => {
                        const imgElement = element.querySelector('img');
                        if (imgElement && imgElement.src) {
                            urls.push(imgElement.src);
                        }
                    });
                    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                        window.ReactNativeWebView.postMessage(JSON.stringify(urls));
                    }
                })();
                true;`);
            } else {
                setInjectionCode(`(function() {
                    const divs = document.querySelectorAll('div[class*="review-content"]');
                    const divContents = [];
                    divs.forEach(div => {
                        divContents.push(div.innerText.trim());
                    });
                    const uniqueContents = Array.from(new Set(divContents));
                    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                        window.ReactNativeWebView.postMessage(JSON.stringify(uniqueContents));
                    }
                })();
                true;`);
            }
        } else {
            setImageWebviewUrl(url);
            setReviewWebviewUrl(url);
            if (type === 'images') {
                setInjectionCode(`(function() {
                    const minWidth = 375 * 0.9;
                    const elements = document.querySelectorAll('img');
                    const urls = [];
                    elements.forEach(element => {
                        if (element.width >= minWidth) {
                            urls.push(element.src);
                        }
                    });
                    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                        window.ReactNativeWebView.postMessage(JSON.stringify(urls));
                    }
                })();
                true;`);
            } else {
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
                        window.ReactNativeWebView.postMessage(JSON.stringify(uniqueContents));
                    }
                })();
                true;`);
            }
        }
    };

    const runJavaScript = () => {
        if (webViewRef.current) {
            console.log('JavaScript 주입:', { type });
            webViewRef.current.injectJavaScript(injectionCode);
        }
    };

    useEffect(() => {
        console.log('WebView 초기화:', { productUrl, type });
        retryCount = 0;
        parseUrl(productUrl);
    }, [productUrl, type]);

    const handleMessage = (event: WebViewMessageEvent) => {
        console.log('handleMessage 시작');
        const data = event.nativeEvent.data;
        try {
            const parsedData = JSON.parse(data);
            console.log('WebView 메시지 수신:', parsedData[0]?.slice(0, 20));

            if (parsedData.length > 0 || retryCount >= maxRetries) {
                console.log('데이터 전송:', { type, contentLength: parsedData.length });
                onMessage(parsedData.slice(0, 20));
            } else {
                console.log('재시도:', { type, retryCount });
                retryCount++;
                runJavaScript();
            }
        } catch (error) {
            console.error('JSON 파싱 실패:', error);
        }
    };

    const handleLoadEnd = () => {
        console.log('WebView 로딩 완료');
        setTimeout(() => {
            if (webViewRef.current) {
                console.log('JavaScript 주입 시도:', { type, injectionCode });
                webViewRef.current.injectJavaScript(injectionCode);
            }
        }, 2000);
    };

    const handleError = (syntheticEvent: any) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('WebView 에러:', nativeEvent);
    };

    return (
        <View style={{ width: '100%', height: 1 }}>
            <WebView
                ref={webViewRef}
                source={{ uri: type === 'images' ? imageWebviewUrl : reviewWebviewUrl }}
                style={{ opacity: 0, height: 0 }} // 화면을 숨김
                cacheEnabled={false}
                cacheMode="LOAD_NO_CACHE"
                renderToHardwareTextureAndroid={true}
                allowsLinkPreview={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onNavigationStateChange={navState => {
                    console.log('WebView 네비게이션 상태 변경:', navState);
                }}
                onLoadEnd={handleLoadEnd}
                onError={handleError}
                onMessage={handleMessage}
            />
        </View>
    );
};
