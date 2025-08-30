// 목적: 상품 상세 정보를 가져오기 위한 "모바일 전용" 웹뷰입니다.
// 기능:
// - 쿠팡 상품 URL을 받아 모바일 페이지를 숨겨진 웹뷰로 로드합니다.
// - 페이지에서 JS를 실행해 상품명/가격/할인율/평점/리뷰/썸네일/상세이미지 등을 추출합니다.
// - 추출 결과는 Product 객체로 변환되어 onMessage 콜백으로 전달됩니다.
// - 다양한 쿠팡 링크 패턴(모바일/데스크톱/앱/리다이렉트)을 일관된 모바일 URL로 변환합니다.

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

      // 별 아이콘 개수를 기반으로 half-star 계산(노란별 .yellow-600)
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

export const useWebViewDetail = ({ productUrl, onMessage, onError }: WebViewProps): ReactElement | null => {
    const webViewRef = useRef<WebView>(null);
    const [url, setUrl] = useState<string>('');
    const [retryCount, setRetryCount] = useState<number>(0);
    const [hasErrorOccurred, setHasErrorOccurred] = useState<boolean>(false);

    const mobileMaxRetries = 3;

    const [ids, setIds] = useState<{ productId?: string; itemId?: string; vendorItemId?: string }>({});
    const [isMobileReady, setIsMobileReady] = useState<boolean>(false);
    const isSuccess = useRef<boolean>(false);

    const handleErrorOnce = () => {
        if (!hasErrorOccurred) {
            setHasErrorOccurred(true);
            onError?.();
        }
    };

    const convertUrl = (input: string) => {
        try {
            let raw = input?.trim() || '';

            // 쿠팡 외 링크면 그대로 사용 (혹은 필요시 차단)
            if (!raw.includes('coupang')) {
                setUrl(raw);
                return;
            }

            // 쿠팡 리퍼럴/단축링크 처리
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
            const productId =
                q.get('productId') ||
                (u.pathname.match(/\/products\/(\d+)/)?.[1] ?? null) ||
                (u.pathname.includes('/su/') && u.pathname.match(/\/items\/(\d+)/)?.[1]) ||
                null;

            if (!productId) {
                console.error('쿠팡 제품 ID를 찾을 수 없습니다. 원본 URL 그대로 사용:', raw);
                setUrl(raw);
                return;
            }

            const itemId = q.get('itemId') || undefined;
            const vendorItemId = q.get('vendorItemId') || undefined;

            setIds({ productId: productId || undefined, itemId, vendorItemId });

            // 모바일 랜딩 URL로 곧바로 이동
            const mobile = buildMobileUrl(productId || undefined, itemId, vendorItemId);
            setUrl(mobile || `https://m.coupang.com/vm/products/${productId}/`);
        } catch (e) {
            console.error('[convertUrl] Error:', e);
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

        const maxRetries = mobileMaxRetries;
        if (retryCount < maxRetries) {
            setRetryCount(c => c + 1);
            setTimeout(() => {
                webViewRef.current?.reload();
            }, 1000);
        } else {
            console.log('--------------------------------모바일 크롤링 실패--------------------------------');
            handleErrorOnce();
        }
    };

    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            if (data.error) {
                handleError();
                return;
            }

            if (data.content?.name) {
                if (
                    isSuccess.current &&
                    (data.content?.detail_images?.length == 0 ||
                        data.content.name == '' ||
                        data.content.thumbnail == '')
                ) {
                    return;
                }
                isSuccess.current = true;
                onMessage({ ...data.content, url: productUrl });
            } else {
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

        setIsMobileReady(false);
        isSuccess.current = false;

        convertUrl(productUrl);
    }, [productUrl]);

    useEffect(() => {
        if (!isMobileReady) return;
        if (retryCount > 0) return;

        // 최초 1회만 주입
        runJavaScript(getMobileInjectionCode(ids.productId, ids.itemId, ids.vendorItemId));
    }, [isMobileReady, retryCount, url, ids.productId, ids.itemId, ids.vendorItemId]);

    return url ? (
        <View style={{ width: '100%', height: 0 }}>
            <WebView
                ref={webViewRef}
                source={{ uri: url }}
                onMessage={handleMessage}
                onLoadEnd={() => {
                    setIsMobileReady(true);
                    runJavaScript(getMobileInjectionCode(ids.productId, ids.itemId, ids.vendorItemId));
                }}
                onError={handleError}
                style={{ flex: 1 }}
                cacheEnabled={false}
                cacheMode="LOAD_NO_CACHE"
                renderToHardwareTextureAndroid={true}
                mediaPlaybackRequiresUserAction={true}
            />
        </View>
    ) : null;
};
