/**
 * 홈 화면 메인 상품 노출
 * - 기본적으로 랜덤 카테고리 상품 노출
 */
import { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { ScrollView, FlatList, View, Text } from 'react-native';
import { useSetAtom } from 'jotai';

import ProductCard from '../ProductCard';
import MoreButton from '../MoreButton';
import useStyle from './style';
import { mainProductsAtom } from '../../stores/product/atoms';

// GetMainProductsResponse 타입 유지를 위한 import
import { MainProductsState, Product } from '../../stores/product/types';
import { useWebViewDetail } from '../webview-detail';

// props 타입 정의
interface MainProductListProps {
    data: MainProductsState;
    category: string;
}

// ref를 통해 외부에서 접근할 수 있는 메서드 정의
export interface MainProductListRef {
    scrollToTop: () => void;
}

const MainProductList = forwardRef<MainProductListRef, MainProductListProps>(({ data, category }, ref) => {
    const [randomCount, onRandomCount] = useState<number>(5);
    const [specialCount, onSpecialCount] = useState<number>(5);
    const [currentProductUrl, setCurrentProductUrl] = useState<string>('');
    const [updatedProducts, setUpdatedProducts] = useState<{ [url: string]: boolean }>({});
    const [processedCount, setProcessedCount] = useState<number>(0);
    const setMainProducts = useSetAtom(mainProductsAtom);
    const allProductsRef = useRef([...data.random, ...data.special]);
    const productIndex = useRef(0);

    const style = useStyle();

    // 로컬 상태 업데이트
    const updateLocalState = (product: Product) => {
        setUpdatedProducts(prev => ({ ...prev, [product.url]: true }));
        setProcessedCount(prev => prev + 1);
    };
    // 전역 상태 업데이트
    const updateGlobalProductData = (updatedProduct: Product) => {
        // mainProductsAtom 업데이트
        setMainProducts(prev => {
            // 각 섹션에서 해당 URL의 상품 찾아 업데이트
            const updateProductInList = (products: Product[]) =>
                products.map(item => {
                    if (item.url === updatedProduct.url) {
                        // 기존 이름 깊은 복사로 보존
                        // const originalName = JSON.parse(JSON.stringify(item.name));

                        // 업데이트된 아이템 생성
                        const updatedItem = {
                            ...item,
                            reviews: updatedProduct.reviews || item.reviews || null,
                            ratings: updatedProduct.ratings || item.ratings || null,
                            discount_rate: updatedProduct.discount_rate || item.discount_rate || null,
                            price: updatedProduct.price || item.price || 0 // null 대신 0으로 기본값 설정
                        };

                        // 이름 다시 설정ㄱ
                        // updatedItem.name = originalName;

                        return updatedItem;
                    }
                    return item;
                });

            return {
                ...prev,
                random: updateProductInList(prev.random),
                special: updateProductInList(prev.special),
                local: prev.local.map(section => ({
                    ...section,
                    products: updateProductInList(section.products)
                }))
            };
        });
    };

    // 상품 정보 업데이트 처리 함수
    const handleUpdateProduct = useCallback(
        (updatedProduct: Product) => {
            console.log('받은 상품 정보:', updatedProduct);
            // 중복 업데이트 방지
            if (updatedProducts[updatedProduct.url]) {
                console.log('이미 업데이트된 상품입니다:', updatedProduct.name);
                return;
            }

            // 상품 정보 업데이트
            console.log('상품 정보 업데이트:', updatedProduct.name);

            updateLocalState(updatedProduct);
            updateGlobalProductData(updatedProduct);

            // 다음 상품으로 이동
            productIndex.current++;
            processNextProduct();
        },
        [setMainProducts]
    );

    const currentProductRef = useRef<Product | null>(null);

    // 재시도 횟수를 관리하기 위한 참조
    const retryCountRef = useRef<{ [url: string]: number }>({});
    const MAX_RETRY = 3; // 최대 재시도 횟수

    // 디테일 웹뷰 컴포넌트 (상품 정보, 리뷰, 평점 정보 가져오기)
    const DetailWebView = useWebViewDetail({
        productUrl: currentProductUrl,
        onMessage: handleUpdateProduct,
        onError: () => {
            // 현재 상품이 존재하는지 확인
            if (!currentProductUrl) return;

            // 현재 URL에 대한 재시도 횟수 가져오기
            const currentRetry = retryCountRef.current[currentProductUrl] || 0;

            if (currentRetry < MAX_RETRY) {
                // 재시도 횟수 증가
                retryCountRef.current[currentProductUrl] = currentRetry + 1;
                console.log(`상품 정보 업데이트 실패, 재시도 ${currentRetry + 1}/${MAX_RETRY}`);

                // URL을 재설정하여 웹뷰 리로드
                setCurrentProductUrl('');
                setTimeout(() => {
                    if (currentProductRef.current) {
                        setCurrentProductUrl(currentProductRef.current.url);
                    }
                }, 500);
            } else {
                // 최대 재시도 횟수 초과, 다음 상품으로 이동
                console.log(`상품 정보 업데이트 실패, 최대 재시도 횟수(${MAX_RETRY}) 초과, 다음 상품으로 이동`);
                productIndex.current++;
                processNextProduct();
            }
        }
    });

    // 다음 상품 처리 함수 - ratings와 reviews가 없는 경우에만 웹뷰 실행
    const processNextProduct = useCallback(() => {
        const allProducts = allProductsRef.current;

        // 모든 상품 처리 완료 확인
        if (productIndex.current >= allProducts.length) {
            // 모든 상품 처리 완료
            setCurrentProductUrl('');
            currentProductRef.current = null;
            console.log('모든 상품 정보 업데이트 완료, 총 처리된 상품:', processedCount);
            return;
        }

        // 다음 상품 처리
        const nextProduct = allProducts[productIndex.current];
        currentProductRef.current = nextProduct;

        // 이미 업데이트된 상품이면 다음으로 넘어감
        if (nextProduct && updatedProducts[nextProduct.url]) {
            console.log(`상품 이미 업데이트됨, 다음으로 넘어갑니다:`, nextProduct.name || nextProduct.url);
            productIndex.current++;
            return;
        }

        // ratings와 reviews 정보가 있는지 확인 (값이 0보다 큰 경우에만 있는 것으로 간주)
        if (
            nextProduct &&
            ((typeof nextProduct.ratings === 'number' && nextProduct.ratings > 0) ||
                (typeof nextProduct.reviews === 'number' && nextProduct.reviews > 0))
        ) {
            console.log(`상품에 이미 평점/리뷰 정보가 있음:`, nextProduct.name || nextProduct.url);
            console.log(`ratings: ${nextProduct.ratings}, reviews: ${nextProduct.reviews}`);

            // 이미 정보가 있으니 업데이트된 것으로 처리
            setUpdatedProducts(prev => ({ ...prev, [nextProduct.url]: true }));
            setProcessedCount(prev => prev + 1);

            return;
        } else if (nextProduct) {
            console.log(`상품에 평점/리뷰 정보가 없음:`, nextProduct.name || nextProduct.url);
            console.log(`ratings: ${nextProduct.ratings}, reviews: ${nextProduct.reviews}`);
        }

        // URL 유효성 검사 추가
        if (nextProduct && nextProduct.url) {
            console.log(`(${productIndex.current + 1}/${allProducts.length}) 상품 처리 중: ${nextProduct.name}`);
            console.log(`상품 URL: ${nextProduct.url}`);

            // 현재 처리 중인 상품 저장 (디버깅용)
            console.log(`인덱스 ${productIndex.current}의 상품 처리 중: ${nextProduct.name}`);

            // 웹뷰 로드를 위한 URL 설정
            setCurrentProductUrl(nextProduct.url);
        } else if (!nextProduct) {
            console.log('처리할 상품이 없습니다');
            productIndex.current++;
        } else {
            // URL이 없는 경우
            console.log('상품 URL이 없어 건너뜁니다:', nextProduct.name || '이름 없음');
            productIndex.current++;
        }
    }, [updatedProducts, processedCount]);

    // 현재 화면에 보이는 상품만 처리하는 함수
    const processVisibleProducts = useCallback(() => {
        // 현재 화면에 보이는 상품만 가져오기
        const visibleRandomProducts = data.random.slice(0, randomCount);
        const visibleSpecialProducts = data.special.slice(0, specialCount);
        const visibleProducts = [...visibleRandomProducts, ...visibleSpecialProducts];

        // 아직 처리되지 않은 보이는 상품만 필터링
        const unprocessedVisibleProducts = visibleProducts.filter(product => !updatedProducts[product.url]);

        if (unprocessedVisibleProducts.length <= 0) {
            console.log(
                '화면에 보이는 처리되지 않은 상품 업데이트 시작 - 총 상품 수:',
                unprocessedVisibleProducts.length
            );
            return;
        }
        allProductsRef.current = unprocessedVisibleProducts;
        productIndex.current = 0;
        setProcessedCount(0);
        processNextProduct();
    }, [data, randomCount, specialCount, updatedProducts]);

    // 컴포넌트 마운트 시 화면에 보이는 상품만 처리 시작
    // useEffect(() => {
    //     // 처음 로드될 때만 실행
    //     if (Object.keys(updatedProducts).length === 0) {
    //         processVisibleProducts();
    //     }
    // }, [data, processNextProduct]);

    // 업데이트가 필요한 상품 필터링 (reviews나 ratings가 없는 상품)
    const filterProductsNeedingUpdate = useCallback((products: Product[]) => {
        return products.filter(product => {
            // ratings와 reviews 정보가 없는 상품만 필터링
            return (
                typeof product.ratings !== 'number' ||
                product.ratings <= 0 ||
                typeof product.reviews !== 'number' ||
                product.reviews <= 0
            );
        });
    }, []);

    // 상품 업데이트 프로세스 시작
    const startUpdateProcess = useCallback(
        (products: Product[]) => {
            const productsToUpdate = filterProductsNeedingUpdate(products);

            if (productsToUpdate.length <= 0) {
                console.log('업데이트가 필요한 상품이 없습니다');
                return;
            }

            console.log('상품 정보 업데이트 시작 - 총 상품 수:', productsToUpdate.length);

            // 상품 처리 시작
            allProductsRef.current = productsToUpdate;
            productIndex.current = 0;
            setProcessedCount(0);
            processNextProduct();
        },
        [filterProductsNeedingUpdate, processNextProduct]
    );

    const onMore = useCallback(
        function (type: 'special' | 'random') {
            let newCount = 0;
            switch (type) {
                case 'special':
                    onSpecialCount(function (prev) {
                        newCount = Math.min(prev + 5, data.special.length);
                        return newCount;
                    });
                    // 추가로 로드된 상품 처리
                    // setTimeout(() => {
                    //     const newVisibleProducts = data.special.slice(specialCount, newCount);
                    //     startUpdateProcess(newVisibleProducts);
                    // }, 100);
                    break;
                case 'random':
                    onRandomCount(function (prev) {
                        newCount = Math.min(prev + 5, data.random.length);
                        return newCount;
                    });
                    // 추가로 로드된 상품 처리
                    // setTimeout(() => {
                    //     const newVisibleProducts = data.random.slice(randomCount, newCount);
                    //     startUpdateProcess(newVisibleProducts);
                    // }, 100);
                    break;
            }
        },
        [data, randomCount, specialCount, startUpdateProcess]
    );

    // 스크롤뷰 ref 추가
    const scrollViewRef = useRef<ScrollView>(null);

    // ref를 통해 외부에서 접근할 수 있는 메서드 노출
    useImperativeHandle(ref, () => ({
        scrollToTop: () => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
            }
        }
    }));

    return (
        <>
            {currentProductUrl && DetailWebView}
            <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
                {data.local
                    .filter(function ({ order }) {
                        return order < 0;
                    })
                    .sort(function (a, b) {
                        return a.order - b.order;
                    })
                    .map(function (item) {
                        return (
                            <View
                                style={style.MainProductSection}
                                key={`discover-main-section-${item.name}-${item.order}`}
                            >
                                <Text style={[style.MainProductSectionTitle]} accessible accessibilityRole="header">
                                    {item.name}
                                </Text>
                            </View>
                        );
                    })}

                {data.random.length > 0 && (
                    <View style={style.MainProductSection}>
                        <Text style={[style.MainProductSectionTitle]} accessible accessibilityRole="header">
                            {category}
                        </Text>

                        <FlatList
                            accessibilityViewIsModal={false}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                            contentContainerStyle={[style.MainProductSectionListContent]}
                            data={data.random.slice(0, randomCount)}
                            keyExtractor={function (item) {
                                return `random-${item.url}`;
                            }}
                            ItemSeparatorComponent={() => (
                                <View style={style.MainProductSectionSeparator} accessible={false} />
                            )}
                            renderItem={function ({ item }) {
                                return <ProductCard data={item} />;
                            }}
                        />
                        {data.random.length > randomCount && (
                            <View style={style.MainProductSectionListFooter}>
                                <MoreButton
                                    onPress={function () {
                                        onMore('random');
                                    }}
                                />
                            </View>
                        )}
                    </View>
                )}

                {data.special.length > 0 && (
                    <View style={style.MainProductSection}>
                        <Text style={[style.MainProductSectionTitle]} accessible accessibilityRole="header">
                            오늘의 특가 상품
                        </Text>

                        <FlatList
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                            contentContainerStyle={[style.MainProductSectionListContent]}
                            data={data.special.slice(0, specialCount)}
                            keyExtractor={function (item) {
                                return `special-${item.url}`;
                            }}
                            ItemSeparatorComponent={() => (
                                <View style={style.MainProductSectionSeparator} accessible={false} />
                            )}
                            renderItem={function ({ item }) {
                                return <ProductCard data={item} />;
                            }}
                        />
                        {data.random.length > randomCount && (
                            <View style={style.MainProductSectionListFooter}>
                                <MoreButton
                                    onPress={function () {
                                        onMore('special');
                                    }}
                                />
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </>
    );
});

export default MainProductList;
