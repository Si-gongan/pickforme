import React, { useRef, useState, useEffect } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { View } from 'react-native';
import { Product } from '../stores/product/types';

interface WebViewProps {
  keyword: string;
  onMessage: (data: Product[]) => void;
}

export const WebViewSearch = ({ keyword, onMessage }: WebViewProps) => {
  const webViewRef = useRef<WebView>(null);
  const [url, setUrl] = useState<string>(`https://m.coupang.com/nm/search?q=${keyword}&page=1`);
  const [retryCount, setRetryCount] = useState<number>(0);
  const maxRetries = 5;

  const searchProductInjectionCode = `(function() {
    try {
      let productElements = document.querySelectorAll('.sdw-similar-product-go-to-sdp-click');
      // throw new Error(productElements.length);

      if (productElements.length === 0) {
        throw new Error(window.location.href);
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
      const payload = JSON.stringify({ content: products });
      window.ReactNativeWebView.postMessage(payload);
    } catch (e) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ error: e.message }));
    }
  })();`;

  const runJavaScript = (code: string) => {
    if (webViewRef.current && code) {
      webViewRef.current!.injectJavaScript(code);
    }
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (keyword === '') {
        return;
      }
      if (data.error) {
        console.error('WebView error:', data.error);
        if (retryCount < maxRetries) {
          setRetryCount(retryCount + 1);
          try {
            setTimeout(() => {
              runJavaScript(searchProductInjectionCode);
            }, 1000);
          }
          catch (error) {
            console.error('Failed to run JavaScript:', error);
          }
        }
        return;
      }
      // console.log('data:', data.content);
      onMessage(data.content);
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
    }
  };

  const handleError = (event: any) => {
    console.warn('WebView error:', event.nativeEvent);
  };

  useEffect(() => {
    setRetryCount(0);
    setUrl(`https://m.coupang.com/nm/search?q=${keyword}&page=1`);
    setTimeout(() => {
      runJavaScript(searchProductInjectionCode);
    }, 500);
  }, [keyword]);

  return (
    <View style={{ width: '100%', height: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        onMessage={handleMessage}
        onLoadEnd={() => runJavaScript(searchProductInjectionCode)}
        onError={handleError}
        style={{ opacity: 0, height: 0 }}
        cacheEnabled={false}
        cacheMode="LOAD_NO_CACHE"
        renderToHardwareTextureAndroid={true}
      />
    </View>
  );
};
