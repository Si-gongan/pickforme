// 목적: 상품 검색 결과를 가져오기 위한 웹뷰입니다.
// 기능:
// 검색 키워드를 받아 쿠팡 모바일 검색 페이지를 숨겨진 웹뷰로 불러옵니다.
// 검색 결과 페이지에서 상품 목록을 추출하여 각 상품의 이름, 썸네일, 가격, 원가, 할인율, 평점, 리뷰 수, URL 등의 정보를 추출합니다.
// 추출된 상품 목록은 Product[] 배열로 변환되어 onMessage 콜백을 통해 부모 컴포넌트로 전달됩니다.
// 특징: 검색 결과 페이지에서 상품 요소를 찾지 못할 경우 최대 5번까지 재시도하는 로직이 포함되어 있습니다.

import React, { useRef, useState, useEffect } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { View } from 'react-native';
import { Product } from '../stores/product/types';

interface WebViewProps {
    keyword: string;
    onMessage: (data: Product[]) => void;
    isSearching: boolean;
}

const searchProductInjectionCode = `
(function() {
    async function scrapeProducts() {
        try {
            let productElements = document.querySelectorAll('.sdw-similar-product-go-to-sdp-click');
            
            if (productElements.length === 0) {
                throw new Error('Failed to find products');
            }
            
            const products = Array.from(productElements).map((product) => {
                const name = product.querySelector('.title')?.innerText || '';
                const thumbnail = product.querySelector('img')?.src || '';
                const priceText = product.querySelector('.discount-price')?.querySelector('strong')?.textContent || '0';
                const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
                const originPriceDoc = product.querySelector('.price');
                const originPriceText = originPriceDoc?.textContent || priceText;
                const origin_price = parseInt(originPriceText.replace(/[^0-9]/g, ''), 10);
                const discountRateDoc = product.querySelector('.percentage')?.textContent || '0';
                const discount_rate = parseInt(discountRateDoc.replace(/[^0-9]/g, ''), 10);
                const ratings = parseFloat(product.querySelector('.rating')?.textContent || '0') * 20;
                const reviews = parseInt(product.querySelector('.rating-total-count')?.textContent.replace(/[^0-9]/g, '') || '0', 10);
                const productId = product.getAttribute('data-product-id') || '';
                const itemId = product.getAttribute('data-item-id') || '';
                const vendorItemId = product.getAttribute('data-vendor-item-id') || '';
                const url = 'https://m.coupang.com/vm/products/' + productId + '?itemId=' + itemId + '&vendorItemId=' + vendorItemId;

                return {
                    name,
                    thumbnail,
                    price,
                    origin_price,
                    discount_rate,
                    ratings,
                    reviews,
                    url
                };
            });
            
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ content: products }));
            }
        } catch (e) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ error: e.message }));
            }
        }
    }

    scrapeProducts();
    return true;
})();
`;

export const WebViewSearch = ({ keyword, onMessage, isSearching }: WebViewProps) => {
    const webViewRef = useRef<WebView>(null);
    const [retryCount, setRetryCount] = useState<number>(0);
    const maxRetries = 5;
    const url = `https://m.coupang.com/nm/search?q=${keyword}&page=1`;

    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.error) {
                if (retryCount < maxRetries) {
                    setRetryCount(retryCount + 1);
                    handleExecuteSearch();
                }
                return;
            }
            onMessage(data.content);
        } catch (error) {
            console.error('Failed to parse WebView message:', error);
        }
    };

    const handleError = (event: any) => {
        if (retryCount < maxRetries) {
            setRetryCount(retryCount + 1);
            setTimeout(() => {
                handleExecuteSearch();
            }, 1000);
        }
    };

    const handleExecuteSearch = () => {
        webViewRef.current?.reload();
    };

    useEffect(() => {
        if (isSearching && keyword) {
            setRetryCount(0);
            handleExecuteSearch();
        }
    }, [isSearching, keyword]);

    if (!isSearching || !keyword) return null;

    return (
        <View style={{ width: '100%', height: 1 }}>
            <WebView
                ref={webViewRef}
                source={{ uri: url }}
                onMessage={handleMessage}
                onLoadEnd={() => {
                    setTimeout(() => {
                        webViewRef.current?.injectJavaScript(searchProductInjectionCode);
                    }, 1000);
                }}
                onError={handleError}
                style={{ opacity: 0, height: 0 }}
                cacheEnabled={false}
                cacheMode="LOAD_NO_CACHE"
                renderToHardwareTextureAndroid={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                onLoadStart={() => {
                    webViewRef.current?.injectJavaScript(`
                        window.ReactNativeWebView = window.ReactNativeWebView || {};
                        true;
                    `);
                }}
            />
        </View>
    );
};
