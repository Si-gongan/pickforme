import React, { useRef, useState, useEffect, ReactElement } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { View } from 'react-native';

interface WebViewProps {
    productUrl: string;
    onMessage: (data: string[]) => void;
}

export const useWebViewReviews = ({ productUrl, onMessage }: WebViewProps): ReactElement => {
    const webViewRef = useRef<WebView>(null);
    const [reviewWebviewUrl, setReviewWebviewUrl] = useState<string>('');
    const [injectionCode, setInjectionCode] = useState<string>('');
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

    useEffect(() => {
        retryCount = 0;
        parseUrl(productUrl);
        runJavaScript();
    }, [productUrl]);

    const handleMessage = (event: WebViewMessageEvent) => {
        const data = event.nativeEvent.data;

        // console.log('WebView message in webview-reviews:', data);

        try {
            const parsedData = JSON.parse(data);
            if (parsedData.content.length > 0 || retryCount >= maxRetries) {
                onMessage(parsedData.content.slice(0, 20));
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

    return (
        <View style={{ width: '100%', height: 1 }}>
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
};
