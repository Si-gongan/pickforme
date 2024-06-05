import React, { useRef, useState, useEffect, ReactElement } from 'react';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';

type WebViewType = 'images' | 'reviews';

interface WebViewProps {
    productId?: string | string[];
    productUrl?: string;
    type: WebViewType;
    onMessage: (data: string[]) => void;
}

export const useWebView = ({ productId, productUrl, type, onMessage }: WebViewProps): ReactElement => {
    const webViewRef = useRef<WebView>(null);
    const [error, setError] = useState<boolean>(false);
    const maxRetries = 10;
    let retryCount = 0;

    const injectJavaScript = productId ? 
    (type === 'images' ? `
        (function() {
            const elements = document.querySelectorAll('.subType-IMAGE, .subType-TEXT');
            const urls = [];
            elements.forEach(element => {
                const imgElement = element.querySelector('img');
                if (imgElement && imgElement.src) {
                    urls.push(imgElement.src);
                }
            });
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'images', content: urls }));
            }
        })();
        true;
    ` : `
        (function() {
            const divs = document.querySelectorAll('div[class*="review-content"]');
            const divContents = [];
            divs.forEach(div => {
                divContents.push(div.innerText.trim());
            });
            const uniqueContents = Array.from(new Set(divContents)); // 중복 제거
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'reviews', content: uniqueContents }));
            }
        })();
        true;
    `) : 
    (type === 'images' ? `
        (function() {
            const minWidth = 375 * 0.9; // 모바일 화면의 90% 이상
            const elements = document.querySelectorAll('img');
            const urls = [];
            elements.forEach(element => {
                if (element.width >= minWidth) {
                    urls.push(element.src);
                }
            });
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'images', content: urls }));
            }
        })();
        true;
    ` : `
        (function() {
            const divs = document.querySelectorAll('div[class*="review"]');
            const divContents = [];
            divs.forEach(div => {
                if (div.innerText.length > 20) {
                    divContents.push(div.innerText.trim());
                }
            });
            const uniqueContents = Array.from(new Set(divContents));
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'reviews', content: uniqueContents }));
            }
        })();
        true;
    `);

    const runJavaScript = () => {
        setTimeout(() => {
            if (webViewRef.current) {
                webViewRef.current.injectJavaScript(injectJavaScript);
            }
        }, 1000);
    };

    useEffect(() => {
        retryCount = 0;
        runJavaScript();
    }, [productId, productUrl]);

    const handleMessage = (event: WebViewMessageEvent) => {
        const data = event.nativeEvent.data;
        try {
            const parsedData = JSON.parse(data);

            if ((type === 'images' && parsedData.type === 'images') || (type === 'reviews' && parsedData.type === 'reviews')) {
                if (parsedData.content.length > 0 || retryCount >= maxRetries) {
                    onMessage(parsedData.content.slice(0, 20));
                } else {
                    retryCount++;
                    runJavaScript();
                }
            }
        } catch (error) {
            console.error('Failed to parse JSON:', error);
        }
    };

    const handleError = (event: any) => {
        console.warn('WebView error:', event.nativeEvent);
        setError(true);
    };

    const webViewUrl = productUrl ? productUrl : type === 'images'
        ? `https://m.coupang.com/vm/products/${productId}`
        : `https://m.coupang.com/vm/products/${productId}/brand-sdp/reviews/detail`;

    return (
        error ? <></> : 
        <WebView
            ref={webViewRef}
            source={{ uri: webViewUrl }}
            onMessage={handleMessage}
            onLoadEnd={runJavaScript}
            onError={handleError}
            style={{ width: 375, height: 0 }} // 웹뷰 화면을 숨김
        />
    );
};
