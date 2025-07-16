import { chromium } from 'playwright-extra';
import type { Browser, BrowserContext, Page } from 'playwright';
import stealth from 'puppeteer-extra-plugin-stealth';
import { EventEmitter } from 'events';

chromium.use(stealth());

interface CrawlRequest {
  id: string;
  url: string;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

interface CrawlResult {
  name: string;
  brand: string;
  price: number;
  origin_price: number;
  discount_rate: number | null;
  ratings: number;
  reviews_count: number;
  thumbnail: string;
  detail_images: string[];
  url: string;
  reviews: string[];
}

class CoupangCrawlerService extends EventEmitter {
  private browser: Browser | null = null;

  private context: BrowserContext | null = null;

  private pages: Page[] = [];

  private maxPages = 5;

  private queue: CrawlRequest[] = [];

  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🔄 쿠팡 크롤러 초기화 중...');

      const randomSessionId = Math.floor(Math.random() * 100000);
      const randomViewport = {
        width: 1200 + Math.floor(Math.random() * 200),
        height: 1800 + Math.floor(Math.random() * 300),
      };

      // 프록시 설정을 환경변수에서 가져오기
      const proxyConfig =
        process.env.PROXY_ENABLED === 'true'
          ? {
              server: process.env.PROXY_SERVER || '',
              username: `${process.env.PROXY_USERNAME || ''}${randomSessionId}`,
              password: process.env.PROXY_PASSWORD || '',
            }
          : undefined;

      this.browser = await chromium.launch({
        headless: true,
        proxy: proxyConfig,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });

      this.context = await this.browser.newContext({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        locale: 'ko-KR',
        ignoreHTTPSErrors: true,
        viewport: randomViewport,
      });

      await this.context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        Object.defineProperty(navigator, 'languages', {
          get: () => ['ko-KR', 'ko'],
        });
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3],
        });
        (window as any).chrome = { runtime: {} };
      });

      await this.context.setExtraHTTPHeaders({
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        'Upgrade-Insecure-Requests': '1',
        Referer: 'https://www.coupang.com/',
      });

      // 초기 페이지들 생성
      for (let i = 0; i < this.maxPages; i++) {
        const page = await this.context.newPage();
        this.pages.push(page);
      }

      this.isInitialized = true;
      console.log('✅ 쿠팡 크롤러 초기화 완료');
    } catch (error) {
      console.error('❌ 쿠팡 크롤러 초기화 실패:', error);
      throw error;
    }
  }

  async crawl(url: string): Promise<CrawlResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const request: CrawlRequest = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        resolve,
        reject,
      };

      this.queue.push(request);
      this.tryProcessQueue(); // 큐에 추가하고 바로 처리 시도
    });
  }

  private tryProcessQueue() {
    // 사용 가능한 페이지가 있고 큐에 요청이 있으면 처리
    while (this.pages.length > 0 && this.queue.length > 0) {
      const page = this.pages.shift();
      const request = this.queue.shift();

      if (page && request) {
        // 비동기로 처리 (await 하지 않음)
        void this.processRequest(request, page);
      }
    }
  }

  private async processRequest(request: CrawlRequest, page: Page): Promise<void> {
    try {
      console.log(`🔍 크롤링 시작 (원본 URL): ${request.url}`);

      const response = await page.goto(request.url, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      if (response?.status() !== 200 || (await page.content()).includes('Access Denied')) {
        throw new Error('접근 차단됨 또는 페이지 로딩 실패');
      }

      // 브라우저에서 리다이렉트된 최종 URL 확인
      const finalUrl = page.url();
      console.log(`📍 최종 리다이렉트된 URL: ${finalUrl}`);

      // 최종 URL에서 productId 추출
      const match = finalUrl.match(/\/products\/(\d+)/);
      const productId = match ? match[1] : null;

      if (!productId) {
        throw new Error('상품 ID를 추출할 수 없습니다.');
      }

      console.log(`🔍 상품 ID: ${productId}`);

      const data = await page.evaluate(() => {
        const result: any = {};
        const getInt = (txt: string) => parseInt((txt || '').replace(/[^0-9]/g, '')) || 0;
        const getImageSrc = (img: HTMLImageElement) =>
          img?.getAttribute('data-src') || img?.getAttribute('srcset') || img?.src || '';

        result.name =
          (document.querySelector('.product-title span') as HTMLElement)?.innerText || '';
        result.brand = (document.querySelector('.brand-info div') as HTMLElement)?.innerText || '';

        const sales = document.querySelector('.price-amount.sales-price-amount') as HTMLElement;
        const final = document.querySelector('.price-amount.final-price-amount') as HTMLElement;
        const priceText = sales?.innerText || final?.innerText || '';
        result.price = getInt(priceText);

        const origin = document.querySelector('.price-amount.original-price-amount') as HTMLElement;
        result.origin_price = getInt(origin?.innerText || '');

        const discountElem = document.querySelector('.original-price > div > div') as HTMLElement;
        const percentMatch = discountElem?.innerText?.match(/\d+/);
        result.discount_rate = percentMatch ? parseInt(percentMatch[0]) : null;

        const rating = document.querySelector('.rating-star-container span') as HTMLElement;
        if (rating?.style?.width) {
          const widthPercent = parseFloat(rating.style.width);
          result.ratings = Math.round((widthPercent / 100) * 5 * 2) / 2;
        } else {
          result.ratings = 0;
        }

        const reviewText =
          (document.querySelector('.rating-count-txt') as HTMLElement)?.innerText || '';
        result.reviews_count = getInt(reviewText);

        const thumb = document.querySelector('.twc-relative.twc-overflow-visible img');
        result.thumbnail = getImageSrc(thumb as HTMLImageElement).replace(/^\/\//, 'https://');

        const detailImages = Array.from(
          document.querySelectorAll('.subType-IMAGE img, .subType-TEXT img')
        )
          .map((img) => getImageSrc(img as HTMLImageElement))
          .filter(Boolean)
          .map((src) => src.replace(/^\/\//, 'https://'));
        result.detail_images = detailImages;

        result.url = window.location.href;
        return result;
      });

      // 리뷰 데이터 가져오기 (이미 추출된 productId 사용)
      const reviews = await page.evaluate(async (pid: string) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const res = await fetch(
            `https://www.coupang.com/next-api/review?productId=${pid}&page=1&size=10&sortBy=ORDER_SCORE_ASC&ratingSummary=true&ratings=&market=`,
            {
              method: 'GET',
              headers: {
                Accept: 'application/json',
              },
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);
          const json = await res.json();
          const contents = json?.rData?.paging?.contents || [];
          return contents.map((r: any) => r.content || '').filter(Boolean);
        } catch (e) {
          return [];
        }
      }, productId);

      data.reviews = reviews;

      if (!data.name) {
        throw new Error('상품 이름을 찾을 수 없습니다.');
      }

      console.log(`✅ 크롤링 완료: ${request.url}`);
      request.resolve(data);
    } catch (error) {
      console.error(`❌ 크롤링 실패: ${request.url}`, error);
      request.reject(error);
    } finally {
      // 페이지를 다시 풀에 반환하고 큐 처리 시도
      this.pages.push(page);
      this.tryProcessQueue(); // 다음 요청 처리 시도
    }
  }

  async cleanup() {
    console.log('🧹 쿠팡 크롤러 정리 중...');

    if (this.pages.length > 0) {
      for (const page of this.pages) {
        await page.close();
      }
      this.pages = [];
    }

    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    this.isInitialized = false;
    console.log('✅ 쿠팡 크롤러 정리 완료');
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      availablePages: this.pages.length,
      queueLength: this.queue.length,
    };
  }
}

// 싱글톤 인스턴스
const coupangCrawlerService = new CoupangCrawlerService();

export default coupangCrawlerService;
