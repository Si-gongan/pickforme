import { useState, useRef, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/core';
import { useSetAtom, useAtomValue, useAtom } from 'jotai';
import {
    View,
    StyleSheet,
    TextInput,
    Image,
    Pressable,
    Text as DefaultText,
    FlatList,
    ScrollView,
    AccessibilityInfo,
    findNodeHandle
} from 'react-native';
import SearchIcon from '../../assets/icons/SearchIcon';
import BackIcon from '../../assets/icons/BackIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import useColorScheme from '../../hooks/useColorScheme';
import type { ColorScheme } from '../../hooks/useColorScheme';
import Colors from '../../constants/Colors';

import {
    setScrapedProductsAtom,
    isSearchingAtom,
    searchSorterAtom,
    searchResultAtom,
    searchProductsAtom,
    getMainProductsAtom,
    mainProductsAtom
} from '../../stores/product/atoms';

import { CATEGORIES, categoryName } from '../../constants/Categories';
import { MainProductList } from '@components';
import { WebViewSearch } from '../../components/webview-search';
import ProductCard from '../../components/ProductCard';

const SORTERS = ['scoreDesc'];
const SORTER_NAME = ['추천순', '낮은가격순', '높은가격순', '판매량순', '최신순'];

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const style = useStyle(colorScheme);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // 상태 관리
    const initialRef = useRef(null);
    const [text, setText] = useState('');
    const [query, setQuery] = useState('');

    // Jotai atoms
    const getMainProducts = useSetAtom(getMainProductsAtom);

    const setScrapedProducts = useSetAtom(setScrapedProductsAtom);
    const searchProducts = useSetAtom(searchProductsAtom);
    const searchResult = useAtomValue(searchResultAtom);
    const searchSorter = useAtomValue(searchSorterAtom);
    const isSearching = useAtomValue(isSearchingAtom);

    // 검색 관련 레퍼런스
    const searchLoadingRef = useRef(null);
    const searchResultRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            const f = () => {
                if (initialRef.current) {
                    const nodeHandle = findNodeHandle(initialRef.current);
                    if (nodeHandle) {
                        AccessibilityInfo.setAccessibilityFocus(nodeHandle);
                    }
                }
            };
            setTimeout(f, 500);
        }, [])
    );

    useEffect(() => {
        let timer = setTimeout(() => {
            const ref = isSearching ? searchLoadingRef : searchResultRef;
            if (ref.current) {
                const nodeHandle = findNodeHandle(ref.current);
                if (nodeHandle) {
                    AccessibilityInfo.setAccessibilityFocus(nodeHandle);
                }
            }
        }, 500);
        return () => {
            clearTimeout(timer);
        };
    }, [isSearching]);

    // 메인 상품 데이터와 카테고리 정보 가져오기
    const [mainProducts, setMainProducts] = useAtom(mainProductsAtom);
    const [currentCategory, setCurrentCategory] = useState('');

    useEffect(() => {
        const randomCategoryId = CATEGORIES[Math.floor(CATEGORIES.length * Math.random())];

        console.log('tabs getMainProducts', randomCategoryId);
        setCurrentCategory(categoryName[randomCategoryId as keyof typeof categoryName]);
        getMainProducts(randomCategoryId);
    }, [getMainProducts]);

    // 검색 핸들러
    const handleClickSend = (sort: string) => {
        if (text === '') {
            return;
        }

        searchProducts({
            query: text,
            page: 1,
            sort,
            onLink: (path: string) => router.push(path as any),
            onQuery: () => setQuery(text)
        });
    };

    const handleChangeText = (text: string) => {
        console.log('handleChangeText', text);
        setScrapedProducts([], '');
        setText(text);
    };

    const handleClickReset = () => {
        handleChangeText('');
    };

    return (
        <View style={style.Container}>
            <View style={style.Header}>
                {/* 검색창 */}
                <View style={style.searchContainer}>
                    {!!query.length && (
                        <Pressable
                            onPress={() => {
                                setQuery('');
                                setText('');
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="뒤로가기"
                            accessible
                        >
                            <BackIcon size={24} color={Colors[colorScheme].text.primary} opacity={1} />
                        </Pressable>
                    )}
                    <View style={style.inputWrap}>
                        <TextInput
                            ref={initialRef}
                            style={style.textArea}
                            underlineColorAndroid="transparent"
                            value={text}
                            returnKeyType="done"
                            onSubmitEditing={() => handleClickSend(searchSorter)}
                            accessible
                            accessibilityLabel="검색어 입력창"
                            onChangeText={handleChangeText}
                            placeholder="찾고 싶은 상품 키워드 또는 링크를 입력해 보세요"
                            placeholderTextColor={Colors[colorScheme].text.placeholder}
                        />
                        {!!text.length && (
                            <Pressable
                                onPress={handleClickReset}
                                accessible
                                accessibilityLabel="삭제"
                                accessibilityRole="button"
                            >
                                <Image
                                    style={style.resetIcon}
                                    source={require('../../assets/images/discover/icReset.png')}
                                />
                                {/* reset 버튼 */}
                            </Pressable>
                        )}
                        <Pressable
                            onPress={() => handleClickSend(searchSorter)}
                            accessible
                            accessibilityLabel="검색하기"
                            accessibilityRole="button"
                        >
                            <SearchIcon size={24} color={Colors[colorScheme].text.primary} opacity={1} />
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* WebView Search */}
            <View accessible={false}>
                <WebViewSearch keyword={text} onMessage={data => setScrapedProducts(data, text)} />
            </View>

            {/* 검색 결과 또는 메인 상품 목록 */}
            {isSearching ? (
                <DefaultText style={style.loading} ref={searchLoadingRef}>
                    검색하신 상품을 로딩중이에요.
                </DefaultText>
            ) : !!query.length ? (
                // 검색 결과
                <>
                    <View style={style.searchStatus}>
                        <View
                            ref={searchResultRef}
                            accessible
                            accessibilityLabel={`총 ${searchResult?.products?.length}건 검색됨`}
                        >
                            <DefaultText style={style.productCount}>총 {searchResult?.products?.length}건</DefaultText>
                        </View>
                        <View style={style.sorterSelector}>
                            {SORTERS.map((sort, idx) => (
                                <Pressable
                                    key={`sort-${sort}`}
                                    onPress={() =>
                                        searchProducts({
                                            query: text,
                                            page: 1,
                                            sort,
                                            onLink: (path: string) => router.push(path as any),
                                            onQuery: () => setQuery(text)
                                        })
                                    }
                                    accessible
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                        sort === searchSorter ? `선택됨 ${SORTER_NAME[idx]}` : SORTER_NAME[idx]
                                    }
                                >
                                    <DefaultText style={sort === searchSorter ? style.selectedSorter : style.sorter}>
                                        {SORTER_NAME[idx]}
                                    </DefaultText>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <ScrollView
                        style={style.scrollView}
                        contentContainerStyle={{
                            paddingBottom: insets.bottom + 80 // BottomTabBar 높이만큼 추가
                        }}
                    >
                        {!!searchResult?.products?.length && (
                            <FlatList
                                scrollEnabled={false}
                                contentContainerStyle={style.searchList}
                                data={searchResult.products}
                                keyExtractor={(product, index) => `search-${product.url}-${index}`}
                                renderItem={({ item: product }) => <ProductCard data={product} type="search" />}
                                ItemSeparatorComponent={() => <View style={style.seperator} accessible={false} />}
                            />
                        )}
                        {!searchResult?.products?.length && (
                            <DefaultText style={style.loading}>검색결과가 없습니다.</DefaultText>
                        )}
                    </ScrollView>
                </>
            ) : (
                // 메인 상품 목록
                <MainProductList data={mainProducts} category={currentCategory} />
            )}
        </View>
    );
}

function useStyle(colorScheme: ColorScheme) {
    const insets = useSafeAreaInsets();
    const theme = Colors[colorScheme];

    return StyleSheet.create({
        Container: {
            flex: 1,
            backgroundColor: theme.background.primary,
            paddingHorizontal: 12
        },
        Header: {
            paddingTop: insets.top,
            height: 55 + insets.top,
            paddingBottom: 8
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 15
        },
        inputWrap: {
            flex: 1,
            marginHorizontal: 0,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            height: 47,
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.primary,
            borderWidth: 1,
            flexDirection: 'row'
        },
        textArea: {
            fontSize: 14,
            flex: 1,
            width: '100%',
            color: theme.text.primary
        },
        resetIcon: {
            flexShrink: 0,
            marginLeft: 14,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center'
        },
        sendIcon: {
            flexShrink: 0,
            marginLeft: 3,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center'
        },
        backButton: {
            width: 24,
            height: 24,
            marginRight: 5,
            flexShrink: 0
        },
        // 여기서부터 검색 결과 관련 스타일
        searchStatus: {
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.border.primary,
            flexDirection: 'row',
            justifyContent: 'space-between'
        },
        productCount: {
            fontWeight: '700',
            color: theme.text.primary
        },
        sorterSelector: {
            marginHorizontal: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 8
        },
        sorter: {
            fontSize: 13,
            color: theme.text.primary
        },
        selectedSorter: {
            fontWeight: '700',
            fontSize: 13,
            color: theme.text.primary
        },
        scrollView: {
            paddingVertical: 20,
            flex: 1
        },
        searchList: {
            paddingHorizontal: 20,
            paddingBottom: 44
        },
        seperator: {
            height: 12,
            width: 1,
            backgroundColor: 'transparent'
        },
        loading: {
            paddingHorizontal: 20,
            textAlign: 'center',
            flex: 1,
            color: theme.text.primary
        }
    });
}
