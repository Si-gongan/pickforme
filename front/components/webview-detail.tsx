// 목적: 상품 상세 정보를 가져오기 위한 웹뷰입니다.
// 기능:
// 쿠팡 상품 URL을 받아 모바일 웹 페이지를 숨겨진 웹뷰로 불러옵니다.
// 웹 페이지에서 JavaScript를 실행하여 상품명, 가격, 할인율, 평점, 리뷰 수, 썸네일, 상세 이미지 등의 정보를 추출합니다.
// 추출된 정보는 Product 객체로 변환되어 onMessage 콜백을 통해 부모 컴포넌트로 전달됩니다.
// 특징: 쿠팡 링크를 다양한 패턴(모바일, 데스크톱, 앱 링크 등)에서 일관된 형식으로 변환하는 기능도 포함되어 있습니다.

import React, { useRef, useState, useEffect, ReactElement } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { View } from 'react-native';
import { Product } from '../stores/product/types';
import { resolveRedirectUrl } from '@/utils/url';

interface WebViewProps {
    productUrl: string;
    onMessage: (data: Product) => void;
    onError?: () => void;
}

export const useWebViewDetail = ({ productUrl, onMessage, onError }: WebViewProps): JSX.Element | null => {
    const webViewRef = useRef<WebView>(null);
    const [url, setUrl] = useState<string>('');
    const [platform, setPlatform] = useState<string>('');
    const [retryCount, setRetryCount] = useState<number>(0);
    const maxRetries = 5;

    const currentUrlInjectionCode = `(function() {
        try {
          const currentUrl = window.location.href;
          const payload = JSON.stringify({ url: currentUrl });
            window.ReactNativeWebView.postMessage(payload);
        } catch (e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ error: e.message }));
        }
      })();`;

    const convertUrl = (url: string) => {
        console.log('url:', url);

        let convertedUrl = '';

        // 쿠팡 URL 처리
        if (url.includes('coupang')) {
            setPlatform('coupang');

            // 쿠팡 앱 링크 처리 (link.coupang.com)
            if (url.includes('link.coupang.com')) {
                resolveRedirectUrl(url).then(redirectUrl => {
                    convertUrl(redirectUrl);
                });
                return;
            }

            // 쿠팡 제품 ID 추출
            let productId = null;

            // 패턴 1: productId= 쿼리 파라미터
            if (url.includes('productId=')) {
                productId = url.split('productId=')[1]?.split('&')[0];
            }
            // 패턴 2: products/ 경로 사용 (모바일 및 데스크톱)
            else if (url.includes('coupang.com/vp/products/') || url.includes('coupang.com/vm/products/')) {
                let idPart = url.split('products/')[1] || '';
                productId = idPart.split(/[\?#]/)[0]; // 쿼리스트링이나 해시 태그 제거
            }
            // 패턴 3: 검색 결과 패턴 (itemId로 시작하는 경우)
            else if (url.includes('/su/') && url.includes('/items/')) {
                const itemMatch = url.match(/\/items\/([0-9]+)/);
                if (itemMatch && itemMatch[1]) productId = itemMatch[1];
            }

            if (!productId) {
                console.error('쿠팡 제품 ID를 찾을 수 없습니다. 원본 URL 그대로 사용:', url);
                setPlatform('general');
                setUrl(url);
                return;
            }

            // 추가 파라미터 추출
            const itemId = url.split('itemId=')[1]?.split('&')[0];
            const vendorItemId = url.split('vendorItemId=')[1]?.split('&')[0];

            // 최종 모바일 URL 구성
            convertedUrl = `https://m.coupang.com/vm/products/${productId}`;
            if (itemId) {
                convertedUrl += `?itemId=${itemId}`;
            }
            if (vendorItemId) {
                convertedUrl += itemId ? `&vendorItemId=${vendorItemId}` : `?vendorItemId=${vendorItemId}`;
            }
        } else {
            // 쿠팡 이외의 URL 처리
            setPlatform('general');
            convertedUrl = url;
        }

        setUrl(convertedUrl);
    };

    const getProductDetailInjectionCode = () => {
        if (platform === 'coupang') {
            return `(function() {
        try {
          const url = window.location.href;
          const thumbnail = document.querySelector('.rds-img img')?.src || '';
          const name = document.querySelector('.ProductInfo_title__fLscZ')?.innerText || '';
          const price = parseInt((document.querySelector('.PriceInfo_finalPrice__qniie')?.innerText || '').replace(/[^0-9]/g, ''));
          
          const origin_price_doc = document.querySelector('.PriceInfo_originalPrice__t8M_9');
          const origin_price = origin_price_doc ? parseInt(origin_price_doc.innerText.replace(/[^0-9]/g, '')) : price;
          
          const discount_rate_doc = document.querySelector('.PriceInfo_discountRate__pfqd9');
          const discount_rate = discount_rate_doc ? parseInt(discount_rate_doc.innerText.replace(/[^0-9]/g, '')) : 0;

          // length of rds-rating-item__left, rds-rating-item__right classes
          const ratings_doc = document.querySelector('#MWEB_PRODUCT_DETAIL_PRODUCT_BADGES');
          const ratings = ratings_doc ? ratings_doc.querySelectorAll('.yellow-600').length * 10 : 0;

          const reviews_doc = document.querySelector('.ProductBadges_productBadgesCount__yOwDf');
          const reviews = reviews_doc ? parseInt(reviews_doc.querySelector('span').innerText.replace(/[^0-9]/g, '')) : 0;

          const elements = document.querySelectorAll('.subType-IMAGE, .subType-TEXT');
          const detail_images = [];
          elements.forEach(element => {
            const imgElement = element.querySelector('img');
            if (imgElement && imgElement.src) {
              detail_images.push(imgElement.src);
            }
          });

          const payload = JSON.stringify({
            content: {
              thumbnail, 
              name, 
              price, 
              origin_price, 
              discount_rate, 
              ratings, 
              reviews,
              detail_images
        }
          });
          window.ReactNativeWebView.postMessage(payload);
        } catch (e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ error: e.message }));
        }
      })();`;
        } else {
            return `(function() {
        try {
          const url = window.location.href;
          const thumbnail = document.querySelector('meta[property="og:image"]')?.content || '';
          const name = document.querySelector('meta[property="og:title"]')?.content || '';
          const price = parseInt((document.querySelector('meta[property="product:price:amount"]')?.content || '').replace(/[^0-9]/g, '')) || 0;
          
          const origin_price = parseInt((document.querySelector('meta[property="product:original_price:amount"]')?.content || '').replace(/[^0-9]/g, ''));
          
          const discount_rate = parseInt((document.querySelector('meta[property="product:discount_rate"]')?.content || '').replace(/[^0-9]/g, ''));
          
          const ratings = parseFloat((document.querySelector('meta[property="product:rating"]')?.content || '').replace(/[^0-9]/g, ''));

          const reviews = parseInt((document.querySelector('meta[property="product:review_count"]')?.content || '').replace(/[^0-9]/g, ''));

          const minWidth = 375 * 0.9;
          const elements = document.querySelectorAll('img');
          const detail_images = [];
          elements.forEach(element => {
            if (element.width >= minWidth) {
              detail_images.push(element.src);
            }
          });

          const payload = JSON.stringify({
            content: {
              thumbnail, 
              name, 
              price, 
              origin_price, 
              discount_rate, 
              ratings, 
              reviews,
              detail_images
        }
          });
          window.ReactNativeWebView.postMessage(payload);
        } catch (e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ error: e.message }));
        }
      })();`;
        }
    };

    const runJavaScript = (code: string) => {
        if (webViewRef.current && code) {
            webViewRef.current.injectJavaScript(code);
        }
    };

    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            // console.log('WebView message in webview-detail:', data);

            if (data.error) {
                // console.error('WebView error:', data.error);
                if (retryCount < maxRetries) {
                    setRetryCount(retryCount + 1);
                    setTimeout(
                        () => runJavaScript(url ? getProductDetailInjectionCode() : currentUrlInjectionCode),
                        1000
                    );
                }
                return;
            }

            if (data.url && !url) {
                convertUrl(data.url);
                setTimeout(() => runJavaScript(getProductDetailInjectionCode()), 500);
            } else if (data.content && data.content.name && data.content.detail_images.length > 0) {
                onMessage({ ...data.content, url: productUrl });
            } else if (retryCount < maxRetries) {
                setRetryCount(retryCount + 1);
                setTimeout(() => runJavaScript(getProductDetailInjectionCode()), 1000);
            }
        } catch (error) {
            console.error('Failed to parse WebView message:', error);
        }
    };

    const handleError = (event: any) => {
        console.warn('WebView error:', event.nativeEvent);
        onError?.();
    };

    useEffect(() => {
        setUrl('');
        setRetryCount(0);
        convertUrl(productUrl);
    }, [productUrl]);

    return url ? (
        <WebView
            ref={webViewRef}
            source={{ uri: url }}
            onMessage={handleMessage}
            onLoadEnd={() => runJavaScript(currentUrlInjectionCode)}
            onError={handleError}
            style={{ opacity: 0, height: 0 }}
            cacheEnabled={false}
            cacheMode="LOAD_NO_CACHE"
            renderToHardwareTextureAndroid={true}
            mediaPlaybackRequiresUserAction={true}
        />
    ) : null;
};
