import React, { useRef, useState, useEffect, ReactElement } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { View } from 'react-native';
import { Product } from '../stores/product/types';

interface WebViewProps {
  productUrl: string;
  onMessage: (data: Product) => void;
}

export const useWebViewDetail = ({ productUrl, onMessage }: WebViewProps): ReactElement => {
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
    // console.log('url:', url);
    let convertedUrl = '';
    // https://m.coupang.com/vm/mlp/mweb/mlp-landing?flowId=2&productId=324788226&itemId=3801974770&vendorItemId=86953840553&...
    if (url.includes('coupang')) {
      setPlatform('coupang');
      if (url.includes('link.coupang.com')) {
        return;
      }
      let productId = url.split('productId=')[1]?.split('&')[0];
      if (!productId) {
        productId = url.split('products/')[1]?.split('?')[0];
      }
      const itemId = url.split('itemId=')[1]?.split('&')[0];
      const vendorItemId = url.split('vendorItemId=')[1]?.split('&')[0];
      convertedUrl = `https://m.coupang.com/vm/products/${productId}`;
      if (itemId) {
        convertedUrl += `?itemId=${itemId}`;
      }
      if (vendorItemId) {
        convertedUrl += `&vendorItemId=${vendorItemId}`;
      }
    } else {
      setPlatform('general');
      convertedUrl = url;
    }
    // console.log('convertedUrl:', convertedUrl);
    setUrl(convertedUrl);
  }

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
          const price = parseInt((document.querySelector('meta[property="product:price:amount"]')?.content || '').replace(/[^0-9]/g, ''));
          
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

      if (data.error) {
        console.error('WebView error:', data.error);
        if (retryCount < maxRetries) {
          setRetryCount(retryCount + 1);
          setTimeout(() => runJavaScript(url ? getProductDetailInjectionCode() : currentUrlInjectionCode), 1000);
        }
        return;
      }

      if (data.url && !url) {
        convertUrl(data.url);
        setTimeout(() => runJavaScript(getProductDetailInjectionCode()), 500);
      } else if (data.content && data.content.name && data.content.detail_images.length > 0) {
        onMessage({...data.content, url: productUrl});
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
  };

  useEffect(() => {
    // console.log('productUrl:', productUrl);
    setRetryCount(0);
    runJavaScript(currentUrlInjectionCode);
  }, [productUrl]);

  return (
    <View style={{ width: '100%', height: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ uri: url ? url : productUrl }}
        onMessage={handleMessage}
        onLoadEnd={() => runJavaScript(currentUrlInjectionCode)}
        onError={handleError}
        style={{ opacity: 0, height: 0 }}
        cacheEnabled={false}
        cacheMode="LOAD_NO_CACHE"
        renderToHardwareTextureAndroid={true}
      />
    </View>
  );
};
