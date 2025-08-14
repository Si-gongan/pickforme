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

type Stage = 'desktop' | 'mobile';

// --- Common JS shim to safely post to RN bridge ---
const POST_SHIM = `
  const __post = (obj) => {
    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(obj));
      } else {
        window.name = "__RNWV__" + JSON.stringify(obj);
        console.log('RNWV-fallback', obj);
      }
    } catch (e) {
      console.log('RNWV-post-error', e && e.message);
    }
  };
  // Try to flush pending payload from window.name if bridge is ready now
  try {
    if (window.name && window.name.startsWith('__RNWV__') && window.ReactNativeWebView?.postMessage) {
      const payload = window.name.replace('__RNWV__', '');
      window.ReactNativeWebView.postMessage(payload);
      window.name = '';
    }
  } catch (_) {}
`;

const buildMobileUrl = (productId?: string, itemId?: string, vendorItemId?: string) => {
    if (!productId) return '';
    const sp = new URLSearchParams({
        flowId: '2',
        productId,
        pageType: 'MLSDP',
        pageValue: productId,
        redirect: 'landing'
    });
    if (itemId) sp.set('itemId', itemId);
    if (vendorItemId) sp.set('vendorItemId', vendorItemId);
    return `https://m.coupang.com/vm/mlp/mweb/mlp-landing?${sp.toString()}`;
};

const getMobileInjectionCode = (productId?: string, itemId?: string, vendorItemId?: string) => {
    const qp: string[] = [];
    if (productId) qp.push('productId=' + encodeURIComponent(productId));
    if (vendorItemId) qp.push('vendorItemId=' + encodeURIComponent(vendorItemId));
    if (itemId) qp.push('itemId=' + encodeURIComponent(itemId));
    const btfUrl = qp.length ? `https://www.coupang.com/next-api/products/btf?${qp.join('&')}` : '';

    return `(() => {\n${POST_SHIM}
      const getInt = (t) => parseInt((t||'').replace(/[^0-9]/g,''))||0;
      const norm = (s) => {
        if (!s) return '';
        if (s.startsWith('//')) return 'https:' + s;
        return s.replace(/^\\/\\//,'https://');
      };
      const isImageUrl = (u) => /(\\.jpg|\\.jpeg|\\.png|\\.webp)(\\?|$)/i.test(u || '');

      try {
        // ---- Mobile DOM parsing ----
        const name = document.querySelector('.product_titleText__mfTNb')?.textContent?.trim() || '';
        const brand = '';
        const price = getInt(document.querySelector('.product_finalPrice__Drw1b')?.textContent || '');
        const origin_price = getInt(document.querySelector('.product_originalPrice__sgo9Z')?.textContent || '');
        const discount_rate = getInt(document.querySelector('.product_discountRateNew__I02mK .product_digits__fiOrT')?.textContent || '');
        const halves = document.querySelectorAll('.rds-rating .yellow-600').length;
        const ratings = Math.round((halves/2)*2)/2;
        const reviews = getInt(document.querySelector('.rds-rating__content span')?.textContent || '');
        const thumbnail = norm(document.querySelector('.product_productImage__gAKd0 img')?.getAttribute('src') || '');

        const finish = (detail_images) => {
          __post({
            content: { name, brand, price, origin_price, discount_rate, ratings, reviews, thumbnail, detail_images: (detail_images||[]), url: location.href }
          });
        };

        if (!${JSON.stringify(!!btfUrl)} || !${JSON.stringify(btfUrl)}) { finish([]); return true; }

        fetch(${JSON.stringify(btfUrl)}, { credentials: 'include' })
          .then(r => r.ok ? r.json() : Promise.reject(new Error('btf http '+r.status)))
          .then(json => {
            const set = new Set();
            if (Array.isArray(json.details)) {
              json.details.forEach(detail => {
                const list = Array.isArray(detail?.vendorItemContentDescriptions)
                  ? detail.vendorItemContentDescriptions : [];
                list.forEach(desc => {
                  const raw = (desc && typeof desc.content === 'string') ? desc.content.trim() : '';
                  if (!raw) return;
                  const url = norm(raw);
                  if (isImageUrl(url)) set.add(url);
                });
              });
            }
            const images = Array.from(set);
            finish(images);
          })
          .catch(()=> finish([]));
      } catch (e) {
        __post({ error: (e && e.message) || 'mobile extract error' });
      }
      true; // Important for WKWebView
    })();`;
};

const getDesktopInjectionCode = () => {
    return `(() => {\n${POST_SHIM}
      try {
        const getInt = (txt) => parseInt((txt || '').replace(/[^0-9]/g, '')) || 0;
        const getImageSrc = (img) => img?.getAttribute('data-src') || img?.getAttribute('srcset') || img?.src || '';

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
        const thumbnail = (getImageSrc(thumb) || '').replace(/^\\/\\//, 'https://');

        const detail_images = Array.from(
          document.querySelectorAll('.subType-IMAGE img, .subType-TEXT img')
        )
          .map((img) => getImageSrc(img))
          .filter(Boolean)
          .map((src) => src.replace(/^\\/\\//, 'https://'));

        __post({
          content: { name, brand, price, origin_price, discount_rate, ratings, reviews, thumbnail, detail_images, url: window.location.href }
        });
      } catch (e) {
        __post({ error: e && e.message ? e.message : 'desktop extract error' });
      }
      true; // Important for WKWebView
    })();`;
};

export const useWebViewDetail = ({ productUrl, onMessage, onError }: WebViewProps): JSX.Element | null => {
    const webViewRef = useRef<WebView>(null);
    const [url, setUrl] = useState<string>('');
    const [_, setPlatform] = useState<string>('');
    const [retryCount, setRetryCount] = useState<number>(0);
    const [hasErrorOccurred, setHasErrorOccurred] = useState<boolean>(false);
    const desktopMaxRetries = 0;
    const mobileMaxRetries = 3;

    const [stage, setStage] = useState<Stage>('desktop');
    const [mobileUrl, setMobileUrl] = useState<string>('');
    const [ids, setIds] = useState<{ productId?: string; itemId?: string; vendorItemId?: string }>({});

    const [isDesktopReady, setIsDesktopReady] = useState<boolean>(false);
    const [isMobileReady, setIsMobileReady] = useState<boolean>(false);
    const isSuccess = useRef<boolean>(false);

    const handleErrorOnce = () => {
        if (!hasErrorOccurred) {
            setHasErrorOccurred(true);
            onError?.();
        }
    };

    const convertUrl = (input: string) => {
        console.log('--------------------------------크롤링 시작--------------------------------', productUrl);

        try {
            let raw = input?.trim() || '';
            let finalUrl = '';

            if (!raw.includes('coupang')) {
                setPlatform('general');
                setUrl(raw);
                return;
            }

            setPlatform('coupang');

            if (raw.includes('link.coupang.com')) {
                resolveRedirectUrl(raw).then(redirectUrl => convertUrl(redirectUrl));
                return;
            }

            if (raw.startsWith('//')) raw = 'https:' + raw;
            if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;

            let u: URL;
            try {
                u = new URL(raw);
            } catch {
                setUrl(raw);
                return;
            }

            const q = u.searchParams;
            let productId =
                q.get('productId') ||
                (u.pathname.match(/\/products\/(\d+)/)?.[1] ?? null) ||
                (u.pathname.includes('/su/') && u.pathname.match(/\/items\/(\d+)/)?.[1]) ||
                null;

            if (!productId) {
                console.error('쿠팡 제품 ID를 찾을 수 없습니다. 원본 URL 그대로 사용:', raw);
                setPlatform('general');
                setUrl(raw);
                return;
            }

            const itemId = q.get('itemId') || undefined;
            const vendorItemId = q.get('vendorItemId') || undefined;

            const params = new URLSearchParams();
            if (itemId) params.set('itemId', itemId);
            if (vendorItemId) params.set('vendorItemId', vendorItemId);

            const qs = params.toString();
            finalUrl = `https://www.coupang.com/vp/products/${productId}${qs ? `?${qs}` : ''}`;

            // ★ 추가: 모바일 URL/ID 저장
            setIds({ productId: productId || undefined, itemId, vendorItemId });
            setMobileUrl(buildMobileUrl(productId || undefined, itemId, vendorItemId));
            setStage('desktop'); // 항상 데스크탑부터
            setUrl(finalUrl);
        } catch (e) {
            console.error('[convertUrl] Error:', e);
            setPlatform('general');
            setUrl(input);
        }
    };

    const runJavaScript = (code: string) => {
        if (webViewRef.current && code) {
            webViewRef.current.injectJavaScript(code);
        }
    };

    const handleError = () => {
        if (isSuccess.current) return;
        if (hasErrorOccurred) return;

        console.error('handleError--------------------------------', retryCount, stage);

        const maxRetries = stage === 'desktop' ? desktopMaxRetries : mobileMaxRetries;
        if (retryCount < maxRetries) {
            setRetryCount(retryCount => retryCount + 1);
            setTimeout(() => {
                runJavaScript(getDesktopInjectionCode());
            }, 1000);
        } else {
            if (stage === 'desktop' && mobileUrl) {
                console.log('change to mobile');

                // ★ 데스크탑 실패 → 모바일로 한 번 더!
                setStage('mobile');
                setRetryCount(0);
                setUrl(mobileUrl);
                setTimeout(() => {
                    runJavaScript(getMobileInjectionCode(ids.productId, ids.itemId, ids.vendorItemId));
                }, 1000);
            } else {
                // 모바일도 실패 → onError
                console.log('--------------------------------크롤링 실패--------------------------------');

                handleErrorOnce();
            }
        }
    };

    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            if (data.error) {
                console.log('🚀 ~ handleMessage ~ data.error:', stage, data.error);
                handleError();
                return;
            }

            if (data.content?.name && data.content?.detail_images?.length > 0) {
                if (isSuccess.current) return;
                console.log('🚀 ~ handleMessage ~ data.content:', stage, data.content);
                isSuccess.current = true;
                onMessage({ ...data.content, url: productUrl });
            } else {
                console.log('🚀 ~ handleMessage ~ no name', stage, data.content);
                handleError();
            }
        } catch (error) {
            console.error('Failed to parse WebView message:', error);
        }
    };

    useEffect(() => {
        setUrl('');
        setRetryCount(0);
        setHasErrorOccurred(false);

        setIsDesktopReady(false);
        setIsMobileReady(false);
        isSuccess.current = false;

        convertUrl(productUrl);
    }, [productUrl]);

    useEffect(() => {
        const stageReady = stage === 'desktop' ? isDesktopReady : isMobileReady;
        if (!stageReady) return;

        if (retryCount > 0) return;

        console.log('[inject once] stage=', stage, 'url=', url, 'retryCount=', retryCount);
        if (webViewRef.current) {
            if (stage === 'desktop') {
                runJavaScript(getDesktopInjectionCode());
            } else {
                runJavaScript(getMobileInjectionCode(ids.productId, ids.itemId, ids.vendorItemId));
            }
        }
    }, [stage, url, retryCount, isDesktopReady, isMobileReady]);

    return url ? (
        <WebView
            ref={webViewRef}
            source={{ uri: url }}
            onMessage={handleMessage}
            onNavigationStateChange={event => {
                // console.log('onNavigationStateChange 최종 url', event.url);
            }}
            onLoadEnd={() => {
                if (stage === 'desktop') {
                    setIsDesktopReady(true);
                } else {
                    setIsMobileReady(true);
                }
            }}
            onError={() => {
                handleError();
            }}
            style={{ flex: 1 }}
            cacheEnabled={false}
            cacheMode="LOAD_NO_CACHE"
            renderToHardwareTextureAndroid={true}
            mediaPlaybackRequiresUserAction={true}
        />
    ) : null;
};
