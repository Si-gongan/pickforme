import { Ids } from './utils';

// 공통 POST 함수와 쿼리 실행 프레임워크
export const COMMON_FRAMEWORK = `

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

// 데스크톱 쿼리 함수
export const DESKTOP_QUERY = `
  if (typeof window.desktopQuery === 'undefined') {
    window.desktopQuery = () => {
    const getImageSrc = (img) =>
      img?.getAttribute('data-src') || img?.getAttribute('srcset') || img?.src || '';
    
    // 접두사 기반 클래스 선택자 헬퍼 함수
    const getByClassPrefix = (prefix) => document.querySelector('[class*="' + prefix + '"]');
    
    const thumbnail = getImageSrc(document.querySelector('.rds-img img')) || '';
    const name = getByClassPrefix('ProductInfo_title')?.innerText?.trim() || '';

    const regularPriceElement = getByClassPrefix('PriceInfo_salePrice');
    const wowPriceElement = getByClassPrefix('PriceInfo_finalPrice');
    const price = (regularPriceElement
      ? regularPriceElement.innerText
      : (wowPriceElement?.innerText || '')).replace(/[^0-9]/g,'');
    const priceInt = parseInt(price || '0');

    const originPriceEl = getByClassPrefix('PriceInfo_originalPrice');
    const origin_price = originPriceEl ? parseInt(originPriceEl.innerText.replace(/[^0-9]/g,'')) : priceInt;

    const discountRateEl = getByClassPrefix('PriceInfo_discountRate');
    const discount_rate = discountRateEl ? parseInt(discountRateEl.innerText.replace(/[^0-9]/g,'')) : 0;

    const ratingsWrap = document.querySelector('#MWEB_PRODUCT_DETAIL_PRODUCT_BADGES');
    const ratings = ratingsWrap ? (ratingsWrap.querySelectorAll('.yellow-600').length / 2) : 0;

    const reviewsWrap = getByClassPrefix('ProductBadges_productBadgesCount');
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

// 모바일 쿼리 함수
export const MOBILE_QUERY = `
  if (typeof window.mobileQuery === 'undefined') {
    window.mobileQuery = () => {
    const getImageSrc = (img) =>
      img?.getAttribute('data-src') || img?.getAttribute('srcset') || img?.src || '';
    
    // 접두사 기반 클래스 선택자 헬퍼 함수
    const getByClassPrefix = (prefix) => document.querySelector('[class*="' + prefix + '"]');
    
    const thumbnail = getImageSrc(document.querySelector('.rds-img img')) || '';
    const name = getByClassPrefix('ProductInfo_title')?.innerText || '';
    
    const regularPriceElement = getByClassPrefix('PriceInfo_salePrice');
    const wowPriceElement = getByClassPrefix('PriceInfo_finalPrice');
    
    const price = regularPriceElement 
      ? parseInt(regularPriceElement.innerText.replace(/[^0-9]/g, ''))
      : parseInt((wowPriceElement?.innerText || '').replace(/[^0-9]/g, ''));
    
    const origin_price_doc = getByClassPrefix('PriceInfo_originalPrice');
    const origin_price = origin_price_doc ? parseInt(origin_price_doc.innerText.replace(/[^0-9]/g, '')) : price;
    
    const discount_rate_doc = getByClassPrefix('PriceInfo_discountRate');
    const discount_rate = discount_rate_doc ? parseInt(discount_rate_doc.innerText.replace(/[^0-9]/g, '')) : 0;

    const ratings_doc = document.querySelector('#MWEB_PRODUCT_DETAIL_PRODUCT_BADGES');
    const ratings = ratings_doc ? ratings_doc.querySelectorAll('.yellow-600').length / 2 : 0;

    const reviews_doc = getByClassPrefix('ProductBadges_productBadgesCount');
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
export const MOBILE_QUERY_2 = (btfUrl: string) => `
  if (typeof window.mobile2Query === 'undefined') {
    window.mobile2Query = async () => {
    const getInt = (t) => parseInt((t||'').replace(/[^0-9]/g,''))||0;
    const norm = (s) => {
      if (!s) return '';
      if (s.startsWith('//')) return 'https:' + s;
      return s.replace(/^\\/\\//,'https://');
    };
    const isImageUrl = (u) => /(\\.jpg|\\.jpeg|\\.png|\\.webp)(\\?|$)/i.test(u || '');
    
    // 접두사 기반 클래스 선택자 헬퍼 함수
    const getByClassPrefix = (prefix) => document.querySelector('[class*="' + prefix + '"]');

    const name = getByClassPrefix('product_titleText')?.textContent?.trim() || '';
    const brand = '';
    const price = getInt(getByClassPrefix('product_finalPrice')?.textContent || '');
    const origin_price = getInt(getByClassPrefix('product_originalPrice')?.textContent || '');
    const discount_rate = getInt(getByClassPrefix('product_discountRateNew')?.querySelector('[class*="product_digits"]')?.textContent || '');
    const halves = document.querySelectorAll('.rds-rating .yellow-600').length;
    const ratings = Math.round((halves/2)*2)/2;
    const reviews = getInt(document.querySelector('.rds-rating__content span')?.textContent || '');
    const thumbnail = norm(getByClassPrefix('product_productImage')?.querySelector('img')?.getAttribute('src') || '');

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

// Injection 코드 생성 함수들
export const getDesktopInjectionCode = () => {
    return `${COMMON_FRAMEWORK}
    ${DESKTOP_QUERY}
    window.executeQuery(window.desktopQuery);
    true;`;
};

export const getMobileInjectionCode = () => {
    return `${COMMON_FRAMEWORK}
    ${MOBILE_QUERY}
    window.executeQuery(window.mobileQuery);
    true;`;
};

export const getMobileInjectionCode2 = (ids: Ids) => {
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
