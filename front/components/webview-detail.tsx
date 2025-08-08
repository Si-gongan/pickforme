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
    const [hasErrorOccurred, setHasErrorOccurred] = useState<boolean>(false);
    const maxRetries = 3;

    const handleErrorOnce = () => {
        if (!hasErrorOccurred) {
            setHasErrorOccurred(true);
            onError?.();
        }
    };

    const convertUrl = (url: string) => {
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
        return `(function() {
          try {
            const getInt = (txt) => parseInt((txt || '').replace(/[^0-9]/g, '')) || 0;
            const getImageSrc = (img) =>
              img?.getAttribute('data-src') || img?.getAttribute('srcset') || img?.src || '';
      
            const name = document.querySelector('.product-title span')?.innerText || '';
            const brand = document.querySelector('.brand-info div')?.innerText || '';
      
            const sales = document.querySelector('.price-amount.sales-price-amount');
            const final = document.querySelector('.price-amount.final-price-amount');
            const priceText = sales?.innerText || final?.innerText || '';
            const price = getInt(priceText);
      
            const origin = document.querySelector('.price-amount.original-price-amount');
            const origin_price = getInt(origin?.innerText || '');
      
            const discountElem = document.querySelector('.original-price > div > div');
            const percentMatch = discountElem?.innerText?.match(/\\d+/);
            const discount_rate = percentMatch ? parseInt(percentMatch[0]) : 0;
      
            const rating = document.querySelector('.rating-star-container span');
            let ratings = 0;
            if (rating?.style?.width) {
              const widthPercent = parseFloat(rating.style.width);
              ratings = Math.round((widthPercent / 100) * 5 * 2) / 2;
            }
      
            const reviewText = document.querySelector('.rating-count-txt')?.innerText || '';
            const reviews = getInt(reviewText);
      
            const thumb = document.querySelector('.twc-relative.twc-overflow-visible img');
            const thumbnail = getImageSrc(thumb)?.replace(/^\\/\\//, 'https://') || '';
      
            const detail_images = Array.from(
              document.querySelectorAll('.subType-IMAGE img, .subType-TEXT img')
            )
              .map((img) => getImageSrc(img))
              .filter(Boolean)
              .map((src) => src.replace(/^\\/\\//, 'https://'));
      
            const payload = {
              content: {
                name,
                brand,
                price,
                origin_price,
                discount_rate,
                ratings,
                reviews,
                thumbnail,
                detail_images,
                url: window.location.href
              }
            };
      
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          } catch (e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ error: e.message }));
          }
        })();`;
    };

    const runJavaScript = (code: string) => {
        if (webViewRef.current && code) {
            webViewRef.current.injectJavaScript(code);
        }
    };

    const handleRetry = () => {
        if (retryCount < maxRetries) {
            setRetryCount(retryCount + 1);
            setTimeout(() => runJavaScript(getProductDetailInjectionCode()), 1000);
        } else {
            handleErrorOnce();
        }
    };

    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            if (data.error) {
                handleRetry();
                return;
            }

            if (data.content?.name && data.content?.detail_images?.length > 0) {
                onMessage({ ...data.content, url: productUrl });
            } else {
                handleRetry();
            }
        } catch (error) {
            console.error('Failed to parse WebView message:', error);
        }
    };

    const handleError = (event: any) => {
        // console.warn('WebView error:', event.nativeEvent);

        if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
                if (webViewRef.current) {
                    webViewRef.current.reload();
                }
            }, 1000 * retryCount); // 점진적으로 대기 시간 증가
        } else {
            handleErrorOnce();
        }
    };

    useEffect(() => {
        setUrl('');
        setRetryCount(0);
        setHasErrorOccurred(false);
        convertUrl(productUrl);
    }, [productUrl]);

    return url ? (
        <WebView
            ref={webViewRef}
            source={{ uri: url }}
            onMessage={handleMessage}
            onLoadEnd={() => runJavaScript(getProductDetailInjectionCode())}
            onError={handleError}
            style={{ opacity: 0, height: 0 }}
            cacheEnabled={false}
            cacheMode="LOAD_NO_CACHE"
            renderToHardwareTextureAndroid={true}
            mediaPlaybackRequiresUserAction={true}
        />
    ) : null;
};
