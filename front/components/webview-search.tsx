// WebViewSearch.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Product } from '../stores/product/types';

interface WebViewProps {
    keyword: string;
    onMessage: (data: Product[]) => void;
    isSearching: boolean;
}

const searchProductInjectionCode = `
(function () {
  // ---------- utils ----------
  const toNumber = (txt='') => {
    const n = (txt+'').replace(/[^0-9]/g,'');
    return n ? parseInt(n,10) : 0;
  };

  const getStar5 = (li) => {
    // desktop 별점은 style="width: 100%" 로 표기됨 (100% = 5.0)
    const star = li.querySelector('.ProductRating_star__RGSlV');
    if (!star) return 0;
    const m = /width:\\s*([0-9.]+)%/.exec(star.getAttribute('style') || '');
    const pct = m ? parseFloat(m[1]) : 0;
    return +(pct / 20).toFixed(2); // 0~5
  };

  const absUrl = (href) => {
    try { return new URL(href, location.origin).href; } catch (e) { return ''; }
  };

  const parseIdsFromHref = (href) => {
    try {
      const u = new URL(href, location.origin);
      const q = u.searchParams;
      return {
        productId: (u.pathname.match(/\\/vp\\/products\\/(\\d+)/) || [])[1] || '',
        itemId: q.get('itemId') || '',
        vendorItemId: q.get('vendorItemId') || ''
      };
    } catch (e) {
      return { productId: '', itemId: '', vendorItemId: '' };
    }
  };

  // ---------- scraper ----------
  function collect() {
    const list = document.querySelectorAll('#product-list > li.ProductUnit_productUnit__Qd6sv');
    if (!list.length) return [];

    const items = [];
    list.forEach((li) => {
      // 광고/위젯/베스트셀러 스킵
      if (li.classList.contains('best-seller')) return;
      if (li.querySelector('.AdMark_adMark__KPMsC')) return;

      const a = li.querySelector('a[href]');
      if (!a) return;

      const name = (li.querySelector('.ProductUnit_productName__gre7e')?.textContent || '').trim();
      const thumbnail = li.querySelector('figure img')?.getAttribute('src') || '';
      const discount_rate = toNumber(li.querySelector('.PriceInfo_discountRate__EsQ8I')?.textContent || '0');
      const origin_price = toNumber(li.querySelector('.PriceInfo_basePrice__8BQ32')?.textContent || '0');
      const price = toNumber(li.querySelector('.Price_priceValue__A4KOr')?.textContent || '0');
      const reviews = toNumber(li.querySelector('.ProductRating_ratingCount__R0Vhz')?.textContent || '0');
      const rating5 = getStar5(li);                 // 0~5
      const ratings = Math.round(rating5 * 20);     // 0~100 (기존 구조와 호환)

      const href = a.getAttribute('href') || '';
      const url = absUrl(href);
      const { productId, itemId, vendorItemId } = parseIdsFromHref(href);

      items.push({
        name,
        thumbnail,
        price,
        origin_price,
        discount_rate,
        ratings,
        reviews,
        url,
        productId,
        itemId,
        vendorItemId,
      });
    });

    return items;
  }

  function post(payload) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }
  }

  // ---------- wait & observe ----------
  let tries = 0;
  const maxTries = 8;
  const pollDelay = 700;

  function tryScrape() {
    const products = collect();
    if (products.length) {
      post({ content: products });
      obs && obs.disconnect();
      return true;
    }
    return false;
  }

  // 즉시 한 번 시도
  if (tryScrape()) { return true; }

  // 폴링
  const timer = setInterval(() => {
    tries++;
    if (tryScrape() || tries >= maxTries) {
      clearInterval(timer);
    } else {
      // 무한스크롤 추가로 더 필요하면 아래 라인 주석 해제
      // window.scrollTo(0, document.body.scrollHeight);
    }
  }, pollDelay);

  // DOM 변경 감지
  const root = document.querySelector('#product-list') || document.body;
  const obs = new MutationObserver(() => { tryScrape(); });
  obs.observe(root, { childList: true, subtree: true });

  true;
})();
`;

export const WebViewSearch = ({ keyword, onMessage, isSearching }: WebViewProps) => {
    const webViewRef = useRef<WebView>(null);
    const [retryCount, setRetryCount] = useState<number>(0);
    const maxRetries = 5;

    // 데스크톱 검색 페이지로 고정
    const url = `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}&page=1`;

    const safeInject = useCallback(() => {
        // CSR 환경을 고려해 약간 지연 후 인젝션
        setTimeout(() => {
            webViewRef.current?.injectJavaScript(searchProductInjectionCode);
        }, 800);
    }, []);

    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data?.error) {
                handleError(data.error);
                return;
            }
            if (Array.isArray(data?.content)) {
                onMessage(data.content);
            }
        } catch (error) {
            console.error('Failed to parse WebView message:', error);
        }
    };

    const handleError = (_err: any) => {
        if (retryCount < maxRetries) {
            setRetryCount(c => c + 1);
            setTimeout(() => {
                handleExecuteSearch();
            }, 1000);
        }
    };

    const handleExecuteSearch = () => {
        // 첫 로드 시에도 reload로 통일 (캐시/CSR 상태 초기화)
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
                // 데스크톱 DOM을 강제하기 위해 UA를 데스크톱으로 설정
                userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
                onMessage={handleMessage}
                onNavigationStateChange={() => {
                    // 라우팅/페이지 변경 시에도 재주입
                    setTimeout(() => {
                        webViewRef.current?.injectJavaScript(searchProductInjectionCode);
                    }, 500);
                }}
                onLoadStart={() => {
                    // ReactNativeWebView 존재 보장 (일부 환경에서 방어적)
                    webViewRef.current?.injectJavaScript(`
            window.ReactNativeWebView = window.ReactNativeWebView || {};
            true;
          `);
                }}
                onLoadEnd={safeInject}
                onError={handleError}
                cacheEnabled={false}
                cacheMode="LOAD_NO_CACHE"
                renderToHardwareTextureAndroid
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                // 숨김용 웹뷰
                style={{ opacity: 0.01, height: 1 }}
            />
        </View>
    );
};
