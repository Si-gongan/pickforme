// 목적: 상품 상세 정보를 가져오기 위한 웹뷰 (전략 큐 기반 리팩터)
// 특징:
// - productUrl → 다양한 시도(데스크톱/모바일/대안) 전략을 큐에 쌓고 순차 실행
// - 각 시도는 url + injection + maxRetries 로 구성
// - onLoadEnd → isReady=true 되면 "해당 시도 1회만" injection
// - handleMessage/handleError 에서 성공/실패를 판정하여 재시도 또는 다음 시도로 이동
// - isReady / hasInjected / retryCount / stage 전부 단일화

import React, { useRef, useState, useEffect, useMemo, useRef as useRefAlias, ReactElement } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { View } from 'react-native';
import { Product } from '../stores/product/types';
import { resolveRedirectUrl } from '@/utils/url';

interface WebViewProps {
    productUrl: string;
    onMessage: (data: Product) => void;
    onError?: () => void;
}

/** ===== 공통 유틸 ===== */

type Ids = { productId?: string; itemId?: string; vendorItemId?: string };

type Attempt = {
    label: string; // 디버깅용 태그
    url: string; // 이 시도에서 열 주소
    getInjection: (ids: Ids) => string; // 이 시도에서 주입할 JS
    maxRetries?: number; // 개별 오버라이드 (기본값 사용 가능)
};

const DEFAULT_MAX_RETRIES = 2; // 통일된 기본 재시도 횟수
const FIRST_INJECT_DELAY_MS = 800; // 최초 주입 딜레이(로딩 안정화)
const RETRY_DELAY_MS = 1000; // 재시도 간격

type ExtractResult =
    | { kind: 'coupang'; ids: Ids; canonicalDesktop: string; mobileVM: string; mobileMLP: string }
    | { kind: 'general'; url: string };

// --- URL 구성 ---
const buildDesktop = (productId?: string, itemId?: string, vendorItemId?: string) => {
    if (!productId) return '';
    const sp = new URLSearchParams();
    if (itemId) sp.set('itemId', itemId);
    if (vendorItemId) sp.set('vendorItemId', vendorItemId);
    const qs = sp.toString();
    return `https://www.coupang.com/vp/products/${productId}${qs ? `?${qs}` : ''}`;
};
const buildMobileVM = (productId: string) => `https://m.coupang.com/vm/products/${productId}/`;

const buildMobileMLP = (productId?: string, itemId?: string, vendorItemId?: string) => {
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

// 공통 POST 함수와 쿼리 실행 프레임워크
const COMMON_FRAMEWORK = `

  // 중복 선언 방지를 위한 체크
  if (typeof window.__post === 'undefined') {
    window.__post = (obj) => {
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
  }
  
  // Try to flush pending payload from window.name if bridge is ready now
  try {
    if (window.name && window.name.startsWith('__RNWV__') && window.ReactNativeWebView?.postMessage) {
      const payload = window.name.replace('__RNWV__', '');
      window.ReactNativeWebView.postMessage(payload);
      window.name = '';
    }
  } catch (_) {}

  // 쿼리 실행 및 결과 전송 함수 (동기/비동기 모두 지원)
  if (typeof window.executeQuery === 'undefined') {
    window.executeQuery = async (queryFunction) => {
      try {
        const result = await queryFunction();
        if (result && result.name) {
          window.__post({ content: { ...result, url: location.href } });
        } else {
          window.__post({ error: 'No valid data found' });
        }
      } catch (e) {
        window.__post({ error: (e && e.message) || 'Query execution error' });
      }
    };
  }
`;
// --- 쿼리 함수들 ---
const DESKTOP_QUERY = `
  if (typeof window.desktopQuery === 'undefined') {
    window.desktopQuery = () => {
    const getImageSrc = (img) =>
      img?.getAttribute('data-src') || img?.getAttribute('srcset') || img?.src || '';
    
    const thumbnail = getImageSrc(document.querySelector('.rds-img img')) || '';
    const name = document.querySelector('.ProductInfo_title__fLscZ')?.innerText?.trim() || '';

    const regularPriceElement = document.querySelector('.PriceInfo_salePrice___kVQC');
    const wowPriceElement = document.querySelector('.PriceInfo_finalPrice__qniie');
    const price = (regularPriceElement
      ? regularPriceElement.innerText
      : (wowPriceElement?.innerText || '')).replace(/[^0-9]/g,'');
    const priceInt = parseInt(price || '0');

    const originPriceEl = document.querySelector('.PriceInfo_originalPrice__t8M_9');
    const origin_price = originPriceEl ? parseInt(originPriceEl.innerText.replace(/[^0-9]/g,'')) : priceInt;

    const discountRateEl = document.querySelector('.PriceInfo_discountRate__pfqd9');
    const discount_rate = discountRateEl ? parseInt(discountRateEl.innerText.replace(/[^0-9]/g,'')) : 0;

    const ratingsWrap = document.querySelector('#MWEB_PRODUCT_DETAIL_PRODUCT_BADGES');
    const ratings = ratingsWrap ? (ratingsWrap.querySelectorAll('.yellow-600').length / 2) : 0;

    const reviewsWrap = document.querySelector('.ProductBadges_productBadgesCount__yOwDf');
    const reviews = reviewsWrap ? parseInt(reviewsWrap.querySelector('span')?.innerText.replace(/[^0-9]/g,'')||'0') : 0;

    const elements = document.querySelectorAll('.subType-IMAGE, .subType-TEXT');
    const detail_images = [];
    elements.forEach(element => {
      element.querySelectorAll('img').forEach(img => {
        const src = getImageSrc(img);
        if (src) detail_images.push(src);
      });
    });

    return { thumbnail, name, price: priceInt, origin_price, discount_rate, ratings, reviews, detail_images };
    };
  }
`;
const MOBILE_QUERY = `
  if (typeof window.mobileQuery === 'undefined') {
    window.mobileQuery = () => {
    const getImageSrc = (img) =>
      img?.getAttribute('data-src') || img?.getAttribute('srcset') || img?.src || '';
    
    const thumbnail = getImageSrc(document.querySelector('.rds-img img')) || '';
    const name = document.querySelector('.ProductInfo_title__fLscZ')?.innerText || '';
    
    const regularPriceElement = document.querySelector('.PriceInfo_salePrice___kVQC');
    const wowPriceElement = document.querySelector('.PriceInfo_finalPrice__qniie');
    
    const price = regularPriceElement 
      ? parseInt(regularPriceElement.innerText.replace(/[^0-9]/g, ''))
      : parseInt((wowPriceElement?.innerText || '').replace(/[^0-9]/g, ''));
    
    const origin_price_doc = document.querySelector('.PriceInfo_originalPrice__t8M_9');
    const origin_price = origin_price_doc ? parseInt(origin_price_doc.innerText.replace(/[^0-9]/g, '')) : price;
    
    const discount_rate_doc = document.querySelector('.PriceInfo_discountRate__pfqd9');
    const discount_rate = discount_rate_doc ? parseInt(discount_rate_doc.innerText.replace(/[^0-9]/g, '')) : 0;

    const ratings_doc = document.querySelector('#MWEB_PRODUCT_DETAIL_PRODUCT_BADGES');
    const ratings = ratings_doc ? ratings_doc.querySelectorAll('.yellow-600').length / 2 : 0;

    const reviews_doc = document.querySelector('.ProductBadges_productBadgesCount__yOwDf');
    const reviews = reviews_doc ? parseInt(reviews_doc.querySelector('span').innerText.replace(/[^0-9]/g, '')) : 0;

    const elements = document.querySelectorAll('.subType-IMAGE, .subType-TEXT');
    const detail_images = [];
    elements.forEach(element => {
      const imgElement = element.querySelector('img');
      if (imgElement) {
        const src = getImageSrc(imgElement);
        if (src) detail_images.push(src);
      }
    });

    return { thumbnail, name, price, origin_price, discount_rate, ratings, reviews, detail_images };
    };
  }
`;
// 모바일 2 쿼리 (detail_images API 호출 포함) - Promise 반환
const MOBILE_QUERY_2 = (btfUrl: string) => `
  if (typeof window.mobile2Query === 'undefined') {
    window.mobile2Query = async () => {
    const getInt = (t) => parseInt((t||'').replace(/[^0-9]/g,''))||0;
    const norm = (s) => {
      if (!s) return '';
      if (s.startsWith('//')) return 'https:' + s;
      return s.replace(/^\\/\\//,'https://');
    };
    const isImageUrl = (u) => /(\\.jpg|\\.jpeg|\\.png|\\.webp)(\\?|$)/i.test(u || '');

    const name = document.querySelector('.product_titleText__mfTNb')?.textContent?.trim() || '';
    const brand = '';
    const price = getInt(document.querySelector('.product_finalPrice__Drw1b')?.textContent || '');
    const origin_price = getInt(document.querySelector('.product_originalPrice__sgo9Z')?.textContent || '');
    const discount_rate = getInt(document.querySelector('.product_discountRateNew__I02mK .product_digits__fiOrT')?.textContent || '');
    const halves = document.querySelectorAll('.rds-rating .yellow-600').length;
    const ratings = Math.round((halves/2)*2)/2;
    const reviews = getInt(document.querySelector('.rds-rating__content span')?.textContent || '');
    const thumbnail = norm(document.querySelector('.product_productImage__gAKd0 img')?.getAttribute('src') || '');

    // 기본 데이터 구성
    const baseData = { name, brand, price, origin_price, discount_rate, ratings, reviews, thumbnail };
    
    // API 호출이 없으면 빈 detail_images로 반환
    const btfUrl = '${btfUrl}';
    if (!btfUrl) {
      return { ...baseData, detail_images: [] };
    }

    // API 호출로 detail_images 가져오기
    try {
      const response = await fetch(btfUrl, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('btf http ' + response.status);
      }
      
      const json = await response.json();
      const set = new Set();
      
      if (Array.isArray(json.details)) {
        json.details.forEach(detail => {
          const list = Array.isArray(detail?.vendorItemContentDescriptions) ? detail.vendorItemContentDescriptions : [];
          list.forEach(desc => {
            const raw = (desc && typeof desc.content === 'string') ? desc.content.trim() : '';
            if (!raw) return;
            const url = norm(raw);
            if (isImageUrl(url)) set.add(url);
          });
        });
      }
      
      const detail_images = Array.from(set);
      return { ...baseData, detail_images };
      
    } catch (error) {
      // API 실패 시에도 기본 데이터는 반환
      console.warn('BTF API failed:', error);
      return { ...baseData, detail_images: [] };
    }
    };
  }
`;

// --- Injection 코드들 ---
const getDesktopInjectionCode = () => {
    return `${COMMON_FRAMEWORK}
    ${DESKTOP_QUERY}
    window.executeQuery(window.desktopQuery);
    true;`;
};

const getMobileInjectionCode = () => {
    return `${COMMON_FRAMEWORK}
    ${MOBILE_QUERY}
    window.executeQuery(window.mobileQuery);
    true;`;
};

const getMobileInjectionCode2 = (ids: Ids) => {
    const { productId, itemId, vendorItemId } = ids || {};
    const qp: string[] = [];
    if (productId) qp.push('productId=' + encodeURIComponent(productId));
    if (vendorItemId) qp.push('vendorItemId=' + encodeURIComponent(vendorItemId));
    if (itemId) qp.push('itemId=' + encodeURIComponent(itemId));
    const btfUrl = qp.length ? `https://www.coupang.com/next-api/products/btf?${qp.join('&')}` : '';

    return `${COMMON_FRAMEWORK}
    ${MOBILE_QUERY_2(btfUrl)}
    window.executeQuery(window.mobile2Query);
    true;`;
};

/** Coupang 여부/ID 추출 및 표준 링크 만들기 */
const extractFromUrl = async (rawInput: string): Promise<ExtractResult> => {
    let raw = rawInput?.trim() || '';
    if (!raw) return { kind: 'general', url: raw };

    // link.coupang.com → 최종 리디렉트 따라가기
    if (raw.includes('link.coupang.com')) {
        try {
            const redirectUrl = await resolveRedirectUrl(raw);
            return extractFromUrl(redirectUrl);
        } catch {
            return { kind: 'general', url: raw };
        }
    }

    if (raw.startsWith('//')) raw = 'https:' + raw;
    if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;

    let u: URL;
    try {
        u = new URL(raw);
    } catch {
        return { kind: 'general', url: raw };
    }

    if (!u.hostname.includes('coupang')) {
        return { kind: 'general', url: raw };
    }

    const q = u.searchParams;
    const productId =
        q.get('productId') ||
        (u.pathname.match(/\/products\/(\d+)/)?.[1] ?? null) ||
        (u.pathname.includes('/su/') && u.pathname.match(/\/items\/(\d+)/)?.[1]) ||
        null;

    if (!productId) {
        return { kind: 'general', url: raw };
    }

    const itemId = q.get('itemId') || undefined;
    const vendorItemId = q.get('vendorItemId') || undefined;

    // 표준 데스크톱/모바일 URL들
    const canonicalDesktop = buildDesktop(productId, itemId, vendorItemId);
    const mobileVM = buildMobileVM(productId);
    const mobileMLP = buildMobileMLP(productId, itemId, vendorItemId);

    return {
        kind: 'coupang',
        ids: { productId: productId || undefined, itemId, vendorItemId },
        canonicalDesktop,
        mobileVM,
        mobileMLP
    };
};

/** ===== 메인 훅 ===== */
export const useWebViewDetail = ({ productUrl, onMessage, onError }: WebViewProps): JSX.Element | null => {
    const webViewRef = useRef<WebView>(null);

    // 전략 큐 + 진행 상태
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [retryCount, setRetryCount] = useState(0);

    // 단일 Ready/Inject 상태
    const [isReady, setIsReady] = useState(false);
    const [hasInjected, setHasInjected] = useState(false);

    // 컨텍스트
    const idsRef = useRef<Ids>({});
    const successRef = useRef(false);
    const erroredRef = useRef(false);

    // 현재 시도
    const currentAttempt = attempts[currentIdx];

    /** productUrl 변경 시: 전략 큐 구성 */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            // 모든 상태 초기화
            setAttempts([]);
            setCurrentIdx(0);
            setRetryCount(0);
            setIsReady(false);
            setHasInjected(false);
            successRef.current = false;
            erroredRef.current = false;
            idsRef.current = {};

            const extracted = await extractFromUrl(productUrl);

            if (cancelled) return;

            if (extracted.kind === 'general') {
                // 쿠팡이 아니면, "그냥 그 URL 열고 간단 주입" 시도 하나만 구성
                setAttempts([
                    {
                        label: 'general',
                        url: extracted.url,
                        getInjection: () => `(function(){ try {
              window.ReactNativeWebView?.postMessage(JSON.stringify({ error: 'non-coupang url' }));
            } catch(e) { window.ReactNativeWebView?.postMessage(JSON.stringify({ error: String(e&&e.message||e) })); } })();`,
                        maxRetries: 0
                    }
                ]);
            } else {
                // 쿠팡: 데스크톱 → 모바일(두 가지) 순으로 시도
                idsRef.current = extracted.ids;
                const queue: Attempt[] = [
                    {
                        label: 'desktop-1',
                        url: extracted.canonicalDesktop,
                        getInjection: () => getDesktopInjectionCode(),
                        maxRetries: 1
                    },
                    {
                        label: 'mobile-vm',
                        url: extracted.mobileVM,
                        getInjection: (ids: Ids) => getMobileInjectionCode(),
                        maxRetries: 2
                    },
                    {
                        label: 'mobile-mlp',
                        url: extracted.mobileMLP,
                        getInjection: (ids: Ids) => getMobileInjectionCode2(ids),
                        maxRetries: 2
                    }
                ].filter(a => !!a.url);
                setAttempts(queue);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [productUrl]);

    /** onLoadEnd → Ready → (시도당 단 1회) 주입 */
    useEffect(() => {
        if (!currentAttempt) return;
        if (!isReady) return;
        if (hasInjected) return;
        // 최초 주입 딜레이 후 1회만
        const t = setTimeout(() => {
            try {
                console.log('link changed, injecting javascript code....', currentAttempt.label);

                const code = currentAttempt.getInjection(idsRef.current);
                webViewRef.current?.injectJavaScript(code);
                setHasInjected(true);
            } catch (e) {
                // 주입 자체가 실패하면 즉시 실패 처리
                triggerFailure();
            }
        }, FIRST_INJECT_DELAY_MS);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, hasInjected, currentAttempt?.label]);

    /** 실패 처리 (재시도 또는 다음 시도 이동) */
    const triggerFailure = () => {
        if (successRef.current || erroredRef.current) return;

        console.log('triggerFailure -----', currentAttempt?.label, retryCount);

        const max = currentAttempt?.maxRetries ?? DEFAULT_MAX_RETRIES;
        if (retryCount < max) {
            // 재주입
            setRetryCount(c => c + 1);
            setTimeout(() => {
                try {
                    webViewRef.current?.reload();
                    const code = currentAttempt!.getInjection(idsRef.current);
                    webViewRef.current?.injectJavaScript(code);
                } catch {}
            }, RETRY_DELAY_MS);
        } else {
            // 다음 시도
            if (currentIdx + 1 < attempts.length) {
                setCurrentIdx(i => i + 1);
                setRetryCount(0);
                setIsReady(false);
                setHasInjected(false);
            } else {
                // 모든 시도 실패
                erroredRef.current = true;
                onError?.();
            }
        }
    };

    /** 성공 처리 */
    const triggerSuccess = (payload: Product) => {
        if (successRef.current) return;
        successRef.current = true;
        onMessage(payload);
    };

    /** 메시지 핸들러: 성공/실패 판정 */
    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.error) {
                // 시도 실패 → 재시도/다음시도
                triggerFailure();
                return;
            }

            const content = data.content;
            if (content?.name) {
                // (옵션) 불완전한 payload 거르기
                if (successRef.current && (!content.detail_images?.length || !content.name || !content.thumbnail)) {
                    return;
                }
                // 원본 productUrl로 치환
                triggerSuccess({ ...content, url: productUrl });
            } else {
                triggerFailure();
            }
        } catch {
            // 파싱 실패도 실패로 처리
            triggerFailure();
        }
    };

    return currentAttempt ? (
        <View style={{ width: '100%', height: 0 }}>
            <WebView
                ref={webViewRef}
                source={{ uri: currentAttempt.url }}
                onMessage={handleMessage}
                onLoadStart={() => {
                    // ReactNativeWebView 객체 보장
                    webViewRef.current?.injectJavaScript(`
                        window.ReactNativeWebView = window.ReactNativeWebView || {};
                        true;
                    `);
                }}
                onLoadEnd={() => setIsReady(true)}
                onError={() => triggerFailure()}
                cacheEnabled={false}
                cacheMode="LOAD_NO_CACHE"
                renderToHardwareTextureAndroid
                mediaPlaybackRequiresUserAction
                style={{ flex: 1 }}
            />
        </View>
    ) : null;
};
