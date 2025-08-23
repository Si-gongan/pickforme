// hooks/useProductSearch.ts
import { searchResultAtom } from '@/stores/product/atoms';
import { useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useRef, useState, useEffect } from 'react';
import { Alert, AppState } from 'react-native';
import { GetProductAPI } from '../stores/product/apis';
import { Product } from '../stores/product/types';
import { sanitizeUrl } from '../utils/url';
import { SearchCoupangAPI } from '../stores/product/apis';
import { logEvent } from '@/services/firebase';
import { v4 as uuid } from 'uuid';

interface UseProductSearchProps {}

const TIMEOUT_DURATION = 5000;

export const useProductSearch = ({}: UseProductSearchProps = {}) => {
    const router = useRouter();
    const [searchText, setSearchText] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ✅ 요청 단위 식별자 & 타이머
    const requestIdRef = useRef<string | null>(null);
    const searchStartAtRef = useRef<number | null>(null);
    const searchModeStartAtRef = useRef<number | null>(null);

    // Jotai atoms
    const [searchSorter, setSearchSorter] = useState('scoreDesc');
    const setSearchResult = useSetAtom(searchResultAtom);

    // 추가: 검색 모드 PV/체류시간
    useEffect(() => {
        if (isSearchMode) {
            searchModeStartAtRef.current = Date.now();
            logEvent('search_mode_view', { route: 'HomeScreen' });
        } else if (searchModeStartAtRef.current) {
            const dwell = Date.now() - searchModeStartAtRef.current;
            logEvent('search_mode_engagement', { engagement_ms: dwell });
            searchModeStartAtRef.current = null;
        }

        const sub = AppState.addEventListener('change', state => {
            if (state !== 'active' && searchModeStartAtRef.current) {
                const dwell = Date.now() - searchModeStartAtRef.current;
                logEvent('search_mode_engagement', { engagement_ms: dwell });
                searchModeStartAtRef.current = null;
            }
        });
        return () => sub.remove();
    }, [isSearchMode]);

    // 타임아웃 제거 함수
    const clearSearchTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    // 검색 상태 초기화
    const resetSearchState = useCallback(() => {
        clearSearchTimeout();
        requestIdRef.current = null;
        searchStartAtRef.current = null;
        searchModeStartAtRef.current = null;
        setIsSearching(false);
        setHasError(false);
        setSearchResult({ count: 0, page: 1, products: [] });
    }, [setSearchResult, clearSearchTimeout]);

    // 검색 버튼 클릭 시
    const handleSearchButtonClick = useCallback(() => {
        clearSearchTimeout();
        if (searchText.trim()) {
            executeSearch(searchText);
        }
    }, [searchText, clearSearchTimeout]);

    // 뒤로가기 버튼 클릭 시
    const handleBackButtonClick = useCallback(() => {
        clearSearchTimeout();
        setIsSearchMode(false);
        setSearchText('');
        resetSearchState();
    }, [resetSearchState, clearSearchTimeout]);

    // URL 검색 처리
    const handleUrlSearch = useCallback(
        async (url: string) => {
            try {
                // url 검색 시에는 검색창으로 가는게 아니라 상품 상세 페이지로 가야함
                const sanitizedUrl = sanitizeUrl(url);

                const response = await GetProductAPI(sanitizedUrl);

                if (response.data?.product) {
                    setSearchResult({
                        count: 1,
                        page: 1,
                        products: [response.data.product]
                    });
                }
            } catch (error) {
                console.error('URL search error:', error);
                setHasError(true);
                setSearchResult({ count: 0, page: 1, products: [] });
            } finally {
                router.push(`/product-detail?productUrl=${encodeURIComponent(sanitizeUrl(url))}`);
            }
        },
        [router]
    );

    // 일반 검색 처리
    const handleKeywordSearch = useCallback(
        async (keyword: string) => {
            try {
                setIsSearching(true);

                requestIdRef.current = uuid();

                await logEvent('search_submit', {
                    request_id: requestIdRef.current,
                    keyword: keyword,
                    sorter: searchSorter,
                    source: 'webview'
                });
                searchStartAtRef.current = Date.now();

                // 검색 시작 후 5초 타임아웃 설정
                timeoutRef.current = setTimeout(async () => {
                    const startedAt = searchStartAtRef.current ?? Date.now();

                    try {
                        if (requestIdRef.current) {
                            await logEvent('search_timeout', {
                                request_id: requestIdRef.current,
                                keyword,
                                after_ms: Date.now() - startedAt,
                                reason: 'webview_timeout'
                            });
                        }
                    } catch {}

                    try {
                        // 1) 서버 크롤링 검색 (fallback)
                        const coupangRes = await SearchCoupangAPI(keyword);
                        const ok =
                            !!coupangRes &&
                            !!coupangRes.data &&
                            !!coupangRes.data.success &&
                            Array.isArray(coupangRes.data.data);

                        const fetched: Product[] = ok ? (coupangRes.data.data as Product[]) : [];
                        const durationMs = Date.now() - startedAt;
                        const success = (fetched.length ?? 0) > 0;

                        if (ok) {
                            // 서버 경로에서는 여기서 handleSearchResults 호출(웹뷰 경로와 중복 로깅 방지하려면
                            // handleSearchResults 안에서 'source: webview'만 찍히도록 유지)

                            // 2) GA: 서버 경로 완료 로깅 (결과 수신 후)
                            if (requestIdRef.current) {
                                await logEvent('search_complete', {
                                    request_id: requestIdRef.current,
                                    keyword,
                                    results_count: fetched.length ?? 0,
                                    duration_ms: durationMs,
                                    success,
                                    source: 'server'
                                });
                            }

                            handleSearchResults(fetched, { skipLog: true });
                        } else {
                            setIsSearching(false);
                            setHasError(true);
                            setSearchResult({ count: 0, page: 1, products: [] });

                            if (requestIdRef.current) {
                                await logEvent('search_complete', {
                                    request_id: requestIdRef.current,
                                    keyword,
                                    results_count: 0,
                                    duration_ms: durationMs,
                                    success: false,
                                    source: 'server'
                                });
                            }

                            Alert.alert('일시적으로 검색에 실패했습니다. 다시 검색해 주세요');
                        }
                    } catch (searchError) {
                        console.log('서버 크롤링 검색 중 에러 발생:', searchError);

                        const durationMs = Date.now() - startedAt;

                        setIsSearching(false);
                        setHasError(true);
                        setSearchResult({ count: 0, page: 1, products: [] });
                        Alert.alert('일시적으로 검색에 실패했습니다. 다시 검색해 주세요');

                        if (requestIdRef.current) {
                            await logEvent('search_complete', {
                                request_id: requestIdRef.current,
                                keyword,
                                results_count: 0,
                                duration_ms: durationMs,
                                success: false,
                                source: 'server'
                            });
                        }
                    }
                }, TIMEOUT_DURATION);
            } catch (error) {
                console.error('Keyword search error:', error);
                setHasError(true);
                setSearchResult({ count: 0, page: 1, products: [] });
            }
        },
        [setSearchResult, clearSearchTimeout]
    );

    // 검색 실행
    const executeSearch = useCallback(
        async (text: string) => {
            resetSearchState();

            if (!text.trim()) {
                return;
            }

            if (text.includes('coupang')) {
                setIsSearchMode(false);
                await handleUrlSearch(text);
            } else {
                setIsSearchMode(true);
                await handleKeywordSearch(text);
            }
        },
        [searchText, hasError, handleUrlSearch, handleKeywordSearch, resetSearchState]
    );

    // 검색어 변경 처리
    const handleSearchTextChange = useCallback(
        (text: string) => {
            setSearchText(text);
        },
        [setSearchText]
    );

    // 정렬 변경 처리
    const handleSortChange = useCallback(
        (value: string) => {
            setSearchSorter(value);
            if (searchText) {
                executeSearch(searchText);
            }
        },
        [searchText, executeSearch, setSearchSorter, clearSearchTimeout]
    );

    const handleSearchResults = useCallback(
        (
            products: Product[],
            opts: {
                skipLog?: boolean;
            } = {}
        ) => {
            if (!opts.skipLog) {
                logEvent('search_complete', {
                    request_id: requestIdRef.current,
                    keyword: searchText,
                    results_count: products?.length ?? 0,
                    duration_ms: Date.now() - (searchStartAtRef.current ?? Date.now()),
                    success: (products?.length ?? 0) > 0,
                    source: 'webview'
                });
            }

            clearSearchTimeout();
            setIsSearching(false);
            setHasError(false);
            setSearchResult({ count: products.length, page: 1, products });
        },
        [setSearchResult, clearSearchTimeout]
    );

    return {
        searchText,
        isSearching,
        hasError,
        searchSorter,
        isSearchMode,
        handleSearchTextChange,
        handleSearchResults,
        executeSearch,
        handleSortChange,
        handleSearchButtonClick,
        handleBackButtonClick,
        resetSearchState
    };
};
