// hooks/useProductSearch.ts
import { searchResultAtom } from '@/stores/product/atoms';
import { useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import { useCallback, useRef, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { GetProductAPI } from '../stores/product/apis';
import { Product } from '../stores/product/types';
import { sanitizeUrl } from '../utils/url';
import { SearchCoupangAPI } from '../stores/product/apis';

interface UseProductSearchProps {}

const TIMEOUT_DURATION = 10000;

export const useProductSearch = ({}: UseProductSearchProps = {}) => {
    const router = useRouter();
    const [searchText, setSearchText] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Jotai atoms
    const [searchSorter, setSearchSorter] = useState('scoreDesc');
    const setSearchResult = useSetAtom(searchResultAtom);

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

                // 검색 시작 후 5초 타임아웃 설정
                timeoutRef.current = setTimeout(async () => {
                    console.log('웹뷰 검색에 실패했습니다. 서버 크롤링 검색을 시도합니다.');

                    // 2. Fallback: 서버 크롤링 검색
                    const coupangRes = await SearchCoupangAPI(keyword);

                    if (
                        coupangRes &&
                        coupangRes.data &&
                        coupangRes.data.success &&
                        Array.isArray(coupangRes.data.data)
                    ) {
                        console.log('서버 크롤링 검색 성공');
                        handleSearchResults(coupangRes.data.data);
                        return;
                    } else {
                        setIsSearching(false);
                        setHasError(true);
                        setSearchResult({ count: 0, page: 1, products: [] });
                        Alert.alert('일시적으로 검색에 실패했습니다. 다시 검색해 주세요');
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
        (products: Product[]) => {
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
