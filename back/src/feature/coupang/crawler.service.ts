import { chromium } from 'playwright-extra';
import type { Browser, BrowserContext, Page } from 'playwright';
import stealth from 'puppeteer-extra-plugin-stealth';
import { EventEmitter } from 'events';

chromium.use(stealth());

interface CrawlRequest {
  id: string;
  type: 'crawl' | 'search';
  url?: string;
  searchText?: string;
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

interface ProductListItem {
  name: string;
  thumbnail: string;
  price: number;
  originPrice: number;
  discountRate: number;
  ratings: number;
  reviews: number;
  url: string;
}

class CoupangCrawlerService extends EventEmitter {
  private browser: Browser | null = null;

  private context: BrowserContext | null = null;

  private pages: Page[] = [];

  private maxPages = 5;

  private queue: CrawlRequest[] = [];

  private isInitialized = false;

  private processingCount = 0; // 현재 처리 중인 요청 수

  private cleanupTimer: NodeJS.Timeout | null = null; // 자동 정리용 타이머

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
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
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
      console.log(`✅ 쿠팡 크롤러 초기화 완료 (세션: ${randomSessionId})`);
    } catch (error) {
      console.error('❌ 쿠팡 크롤러 초기화 실패:', error);
      throw error;
    }
  }

  async crawl(url: string): Promise<CrawlResult> {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    if (!this.isInitialized) {
      await this.initialize();
    }
    return new Promise((resolve, reject) => {
      const request: CrawlRequest = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'crawl',
        url,
        resolve,
        reject,
      };
      this.queue.push(request);
      this.tryProcessQueue();
    });
  }

  async search(searchText: string): Promise<ProductListItem[]> {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    if (!this.isInitialized) {
      await this.initialize();
    }
    return new Promise((resolve, reject) => {
      const request: CrawlRequest = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'search',
        searchText,
        resolve,
        reject,
      };
      this.queue.push(request);
      this.tryProcessQueue();
    });
  }

  private tryProcessQueue() {
    // 사용 가능한 페이지가 있고 큐에 요청이 있으면 처리
    while (this.pages.length > 0 && this.queue.length > 0) {
      const page = this.pages.shift();
      const request = this.queue.shift();
      if (page && request) {
        this.processingCount++;
        void this.processRequest(request, page);
      }
    }
  }

  // 상품 상세 정보 크롤링
  private async crawlProductInfo(request: CrawlRequest, page: Page): Promise<any> {
    console.log(`🔍 크롤링 시작 (원본 URL): ${request.url}`);
    const response = await page.goto(request.url!, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    if (response?.status() !== 200 || (await page.content()).includes('Access Denied')) {
      throw new Error('접근 차단됨 또는 페이지 로딩 실패');
    }
    const finalUrl = page.url();
    console.log(`📍 최종 리다이렉트된 URL: ${finalUrl}`);
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
      result.name = (document.querySelector('.product-title span') as HTMLElement)?.innerText || '';
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
      throw new Error('상품 정보를 가져오는데 실패했습니다.');
    }
    console.log(`✅ 크롤링 완료: ${request.url}`);
    return data;
  }

  // 상품 리스트 검색
  private async searchProduct(request: CrawlRequest, page: Page): Promise<any> {
    console.log(`🔍 검색 시작 (검색어): ${request.searchText}`);
    const searchUrl = `https://www.coupang.com/np/search?q=${encodeURIComponent(request.searchText!)}`;

    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // li의 class 중에 "ProductUnit_" 접두사가 포함된 항목을 기다림
    const liSelector = 'li[class^="ProductUnit_"], li[class*=" ProductUnit_"]';
    await page.waitForSelector(liSelector, { timeout: 10000 });

    const products = await page.evaluate((liSel) => {
      function getInt(txt: string) {
        return parseInt((txt || '').replace(/[^0-9]/g, ''), 10) || 0;
      }
      function getFloat(txt: string) {
        return parseFloat((txt || '').replace(/[^0-9.]/g, '')) || 0;
      }

      // 접두사 기반 셀렉터 유틸 (단일)
      const qs = (root: ParentNode, prefix: string) =>
        root.querySelector<HTMLElement>(`[class^="${prefix}"], [class*=" ${prefix}"]`);

      // 접두사 기반 셀렉터 유틸 (복수)
      const qsa = (root: ParentNode, prefix: string) =>
        Array.from(
          root.querySelectorAll<HTMLElement>(`[class^="${prefix}"], [class*=" ${prefix}"]`)
        );

      return Array.from(document.querySelectorAll<HTMLElement>(liSel)).map((li) => {
        // 링크/URL
        const aTag = li.querySelector<HTMLAnchorElement>('a');
        const href = aTag?.getAttribute('href') || '';
        const url = href ? (href.startsWith('http') ? href : 'https://www.coupang.com' + href) : '';

        // 제목
        const name = qs(li, 'ProductUnit_productName')?.innerText?.trim() || '';

        // 썸네일 (li 안 첫 번째 img 우선)
        const thumbnail = li.querySelector<HTMLImageElement>('img')?.src || '';

        // 가격 영역
        const priceText = qs(li, 'Price_priceValue__')?.innerText || '';
        const price = getInt(priceText);

        const originPriceText = qs(li, 'PriceInfo_basePrice__')?.innerText || '';
        const originPrice = getInt(originPriceText);

        const discountRateText = qs(li, 'PriceInfo_discountRate__')?.innerText || '';
        const discountRate = getInt(discountRateText);

        // 별점 (width 퍼센트 → 5점 환산, 0.5 단위 반올림)
        let ratings = 0;
        const starDiv = qs(li, 'ProductRating_star__') as HTMLElement | null;
        if (starDiv) {
          // inline style 또는 style 속성 문자열에서 width 추출
          const widthStr =
            starDiv.style?.width ||
            (starDiv.getAttribute('style') || '').match(/width:\s*([\d.]+)%/)?.[1] ||
            '';
          const pct = parseFloat(widthStr);
          if (!Number.isNaN(pct)) {
            ratings = Math.round((pct / 100) * 5 * 2) / 2;
          }
        }

        // 리뷰 수
        const reviewText = qs(li, 'ProductRating_ratingCount__')?.innerText || '';
        const reviews = getInt(reviewText);

        return { name, thumbnail, price, originPrice, discountRate, ratings, reviews, url };
      });
    }, liSelector);

    return products;
  }

  private async processRequest(request: CrawlRequest, page: Page): Promise<void> {
    try {
      let result;
      if (request.type === 'crawl' && request.url) {
        result = await this.crawlProductInfo(request, page);
      } else if (request.type === 'search' && request.searchText) {
        result = await this.searchProduct(request, page);
      } else {
        throw new Error('잘못된 요청입니다.');
      }
      request.resolve(result);
    } catch (error) {
      console.error('❌ 요청 처리 실패:', error);
      request.reject(error);
    } finally {
      this.processingCount--;
      this.pages.push(page);
      this.tryProcessQueue();
      this.scheduleCleanupIfIdle();
    }
  }

  private scheduleCleanupIfIdle() {
    // 큐가 비어있고 처리 중인 요청이 없으면 자동 정리 스케줄링
    if (this.queue.length === 0 && this.processingCount === 0) {
      console.log('🧹 유휴 상태 확인됨. 브라우저 즉시 정리 시작...');
      void this.cleanup();
    }
  }

  async cleanup() {
    console.log('🧹 쿠팡 크롤러 정리 중...');

    // 자동 정리 타이머 취소
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }

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
    console.log('✅ 쿠팡 크롤러 정리 완료 (새로운 요청 시 새 세션으로 시작됩니다)');
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      availablePages: this.pages.length,
      queueLength: this.queue.length,
      processingCount: this.processingCount,
      hasCleanupScheduled: this.cleanupTimer !== null,
    };
  }
}

// 싱글톤 인스턴스
const coupangCrawlerService = new CoupangCrawlerService();

export default coupangCrawlerService;
