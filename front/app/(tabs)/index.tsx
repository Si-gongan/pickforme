import { useState, useRef, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/core';
import { useSetAtom, useAtomValue } from 'jotai';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

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
    const style = useStyle();
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

    useEffect(() => {
        console.log('searchResult', searchResult);
        console.log('searchSorter', searchSorter);
    }, [searchResult, searchSorter]);

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

    useEffect(() => {
        const id = CATEGORIES[Math.floor(CATEGORIES.length * Math.random())];
        getMainProducts(id);
    }, [getMainProducts]);

    // 검색 핸들러
    const handleClickSend = (sort: string) => {
        searchProducts({
            query: text,
            page: 1,
            sort,
            onLink: (path: string) => router.push(path as any),
            onQuery: () => setQuery(text)
        });
    };

    const handleClickReset = () => {
        setText('');
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
                            <Image style={style.backButton} source={require('../../assets/images/icBack.png')} />
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
                            onChangeText={text => setText(text)}
                            placeholder="찾고 싶은 상품 키워드 또는 링크를 입력해 보세요"
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
                            </Pressable>
                        )}
                        <Pressable
                            onPress={() => handleClickSend(searchSorter)}
                            accessible
                            accessibilityLabel="검색하기"
                            accessibilityRole="button"
                        >
                            <Image
                                style={style.sendIcon}
                                source={require('../../assets/images/discover/icSearch.png')}
                            />
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

                    <ScrollView style={style.scrollView}>
                        {!!searchResult?.products?.length && (
                            <FlatList
                                scrollEnabled={false}
                                contentContainerStyle={style.searchList}
                                data={searchResult.products}
                                keyExtractor={product => `search-${product.url}`}
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
                <MainProductList />
            )}
        </View>
    );
}

function useStyle() {
    const insets = useSafeAreaInsets();

    return StyleSheet.create({
        Container: {
            flex: 1,
            backgroundColor: '#fff',
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
            backgroundColor: 'white',
            borderColor: '#5F5F5F',
            borderWidth: 1,
            flexDirection: 'row'
        },
        textArea: {
            fontSize: 14,
            flex: 1,
            width: '100%'
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
            borderBottomColor: '#d9d9d9',
            flexDirection: 'row',
            justifyContent: 'space-between'
        },
        productCount: {
            fontWeight: '700'
        },
        sorterSelector: {
            marginHorizontal: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 8
        },
        sorter: {
            fontSize: 13
        },
        selectedSorter: {
            fontWeight: '700',
            fontSize: 13
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
            flex: 1
        }
    });
}
