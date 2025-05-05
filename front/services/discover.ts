import { useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import client, { attempt } from '../utils/axios';
import { GetMainProductsAPI, GetProductAPI } from '../stores/product/apis';

import { IDicoverMainProducts, IProductDetail } from '@types';

const CATEGORIES = {
    '1001': '여성패션',
    '1002': '남성패션',
    '1010': '뷰티',
    '1011': '출산/육아',
    '1012': '식품',
    '1013': '주방용품',
    '1014': '생활용품',
    '1015': '홈인테리어',
    '1016': '가전디지털',
    '1017': '스포츠/레저',
    '1018': '자동차용품',
    '1019': '도서/음반/DVD',
    '1020': '완구/취미',
    '1021': '문구/오피스',
    '1024': '헬스/건강식품',
    '1025': '국내여행',
    '1026': '해외여행',
    '1029': '반려동물용품',
    '1030': '유아동패션'
};

export function useServiceMainProducts() {
    /**
     * 카테고리별 베스트 (랜덩) + 오늘의 특가 상품 (스페셜)
     */
    const categoryId = useMemo(function () {
        const keys = Object.keys(CATEGORIES);
        return keys[Math.floor(keys.length * Math.random())];
    }, []);

    const category = useMemo(
        function () {
            return CATEGORIES[categoryId as keyof typeof CATEGORIES];
        },
        [categoryId]
    );

    const { data } = useQuery<IDicoverMainProducts>({
        queryKey: ['fetchMainProducs', categoryId],
        queryFn: async function ({ signal }) {
            console.log('[MainProducts] API 호출 시작:', {
                categoryId,
                url: `/discover/products/${categoryId}`
            });

            try {
                // attempt 패턴과 GetMainProductsAPI 사용
                const result = await attempt(() => GetMainProductsAPI(categoryId));

                if (!result.ok) {
                    console.error('[MainProducts] API 호출 실패:', result.error);
                    throw new Error('FAIL_FETCH_MAIN_PRODUCTS');
                }

                const response = result.value;

                console.log('[MainProducts] API 응답:', {
                    status: response.status,
                    data: {
                        specialCount: response.data.special?.length || 0,
                        randomCount: response.data.random?.length || 0,
                        localCount: response.data.local?.length || 0
                    }
                });

                if (response.status === 200) {
                    return response.data;
                }
                throw new Error('FAIL_FETCH_MAIN_PRODUCTS');
            } catch (error) {
                console.error('[MainProducts] API 호출 실패:', {
                    error,
                    categoryId,
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
                throw error;
            }
        },
        enabled: !!categoryId,
        initialData: {
            special: [],
            random: [],
            local: []
        },
        gcTime: 60 * 5
    });

    // 데이터 변경 감지
    useEffect(() => {
        console.log('[MainProducts] 데이터 업데이트:', {
            categoryId,
            data: {
                specialCount: data.special?.length || 0,
                randomCount: data.random?.length || 0,
                localCount: data.local?.length || 0
            }
        });
    }, [data, categoryId]);

    return { data, category };
}

export function useServiceProductDetail(url: string | null | undefined) {
    const { data } = useQuery<IProductDetail>({
        queryKey: ['fetchProductDetail', url],
        queryFn: async function ({ signal }) {
            try {
                // attempt 패턴과 GetProductAPI 사용
                const result = await attempt(() => GetProductAPI(url || ''));
                
                if (!result.ok) {
                    console.error('[ProductDetail] API 호출 실패:', result.error);
                    throw new Error('FAIL_FETCH_PRODUCT_DETAIL');
                }
                
                const response = result.value;
                console.log(response.status, response.data);
                
                if (response.status === 200 || response.status === 204) {
                    return response.data;
                }
                throw new Error('FAIL_FETCH_PRODUCT_DETAIL');
            } catch (error) {
                console.error('[ProductDetail] API 호출 실패:', {
                    error,
                    url,
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
                throw error;
            }
        },
        enabled: !!url
    });

    return { data };
}
