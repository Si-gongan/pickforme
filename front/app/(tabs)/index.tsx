import React, { useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/core';
import { useSetAtom, useAtomValue } from 'jotai';
import { Image, TextInput, Text as TextBase, Pressable, FlatList, ScrollView, View as ViewBase, StyleSheet, AccessibilityInfo, findNodeHandle } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { setClipboardProductAtom, clipboardProductAtom, isSearchingAtom, searchSorterAtom, searchResultAtom, searchProductsAtom, getMainProductsAtom, mainProductsAtom } from '../../stores/product/atoms';

import { CATEGORIES, categoryName } from '../../constants/Categories';
import { Text, View } from '../../components/Themed';
import Colors from '../../constants/Colors';
import useColorScheme, { ColorScheme } from '../../hooks/useColorScheme';
import ProductCard from '../../components/ProductCard';

// 2024
import {
  isShowVersionUpdateAlarmModalAtom,
  isShowIntroduceAlertAtom,
  // isShowNonSubscribedModalAtom,
  // isShowMembershipSubscription, 
  // isShowAiFunctionLimitationsAtom, 
  // isShowManagerFunctionRestrictionsAtom, 
  // isShowCancelMembershipPaymentAtom, 
  // isShowMembershipPaymentCancellationWeekAtom 
} from '../../stores/auth/atoms';
import * as Application from 'expo-application';

const SORTERS = [
  'scoreDesc',
  'salePriceAsc',
  'salePriceDesc',
  'saleCountDesc',
  'latestAsc'
];

const SORTER_NAME = [
  '추천순',
  '낮은가격순',
  '높은가격순',
  '판매량순',
  '최신순'
];

const MoreButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  return (
    <Pressable onPress={onClick} accessibilityRole='button' accessibilityLabel='상품 더보기' accessible style={styles.more}>
      <Text style={styles.moreText}> 상품 더보기</Text>
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const initialRef = useRef(null);

  const getMainProducts = useSetAtom(getMainProductsAtom);
  const mainProducts = useAtomValue(mainProductsAtom);

  const searchProducts = useSetAtom(searchProductsAtom);
  const searchResult = useAtomValue(searchResultAtom);
  const searchSorter = useAtomValue(searchSorterAtom);
  const isSearching = useAtomValue(isSearchingAtom);

  const searchLoadingRef = useRef(null);
  const searchResultRef = useRef(null);

  const [category, setCategory] = React.useState('');

  // const clipboardProduct = useAtomValue(clipboardProductAtom);
  // const setClipboardProduct = useSetAtom(setClipboardProductAtom);

  useFocusEffect(
    useCallback(() => {
      const f = () => {
        if (initialRef.current) {
          const nodeHandle = findNodeHandle(initialRef.current);
          if (nodeHandle) {
            AccessibilityInfo.setAccessibilityFocus(nodeHandle);
          }
        }
      }
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
    }
  }, [isSearching]);

  // React.useEffect(() => {
  //   Clipboard.getStringAsync().then((text) => {
  //     if (!text.length) {
  //       return;
  //     }
  //     setClipboardProduct(text);
  //   });
  // }, []);

  // React.useEffect(() => {
  //   let timer = setTimeout(() => {
  //     const ref = clipboardRef;
  //     if (ref.current) {
  //       const nodeHandle = findNodeHandle(ref.current);
  //       if (nodeHandle) {
  //         AccessibilityInfo.setAccessibilityFocus(nodeHandle);
  //         timer = setTimeout(() => {
  //           setClipboardProduct('');
  //         }, 4500);
  //       }
  //     }
  //   }, 500);
  //   return () => {
  //     clearTimeout(timer);
  //   }
  // }, []);

  // const clipboardRef = useRef(null);
  const focusRef1 = useRef<ViewBase>(null);
  const focusRef2 = useRef<ViewBase>(null);

  const styles = useStyles(colorScheme);
  const [query, setQuery] = React.useState('');

  const [focus, setFocus] = React.useState({
    special: '',
    random: '',
  });
  const [length, setLength] = React.useState({
    special: 5,
    random: 5,
  });
  const [text, setText] = React.useState('');

  const handleClickSend = (sort: string) => {
    searchProducts({ query: text, page: 1, sort, onLink: router.push, onQuery: () => setQuery(text) });
  }

  const handleClickReset = () => {
    setText('');
  }

  const handleClickMore = (key: keyof typeof length) => {
    const nextNum = Math.min(mainProducts[key].length, length[key] + 5);
    setLength({
      ...length,
      [key]: nextNum,
    });
    const nextFocus = Math.min(mainProducts[key].length, length[key] + 1);
    setFocus({
      ...focus,
      [key]: mainProducts[key][nextFocus - 1].url,
    });
    setTimeout(() => {
      const ref = key === 'random' ? focusRef1 : focusRef2;
      if (ref.current) {
        const nodeHandle = findNodeHandle(ref.current);
        if (nodeHandle) {
          AccessibilityInfo.setAccessibilityFocus(nodeHandle);
        }
      }
    }, 500);
  }
  useEffect(() => {
    const id = CATEGORIES[Math.floor(CATEGORIES.length * Math.random())];
    setCategory(categoryName[id as keyof typeof categoryName]);
    getMainProducts(id);
  }, [getMainProducts]);

  // 2024-08-26(월) TODO
  const applicationVersion = Application.nativeApplicationVersion;
  const APPLICATION_VERSION = "3.0.0";
  const setIsShowVersionUpdateAlarmModal = useSetAtom(isShowVersionUpdateAlarmModalAtom);
  const setIsShowIntroduceAlertModal = useSetAtom(isShowIntroduceAlertAtom);
  // const setIsShowNonSubscribedModal = useSetAtom(isShowNonSubscribedModalAtom);
  // const setIsShowMembershipSubscriptionModal = useSetAtom(isShowMembershipSubscription);
  // const setIsAiFunctionLimitationsModal = useSetAtom(isShowAiFunctionLimitationsAtom);
  // const setIsManagerFunctionRestrictionsModal = useSetAtom(isShowManagerFunctionRestrictionsAtom);
  // const setIsCancelMembershipPaymentModal = useSetAtom(isShowCancelMembershipPaymentAtom);
  // const setIsMembershipPaymentCancellationWeekModal = useSetAtom(isShowMembershipPaymentCancellationWeekAtom);

  // 버전 비교 함수
  function isVersionLessThan(version: string, baseVersion: string) {
    const versionParts = version.split('.').map(Number);      // e.g., [2, 5, 1]
    const baseVersionParts = baseVersion.split('.').map(Number); // e.g., [3, 0, 0]

    for (let i = 0; i < 3; i++) {
      if (versionParts[i] < baseVersionParts[i]) {
        return true;
      } else if (versionParts[i] > baseVersionParts[i]) {
        return false;
      }
    }
    return false; // 동일한 버전일 경우
  }

  useEffect(() => { // 업데이트 관련
    if (applicationVersion && isVersionLessThan(applicationVersion, APPLICATION_VERSION)) {
      // 3.0.0 미만 버전일 경우 업데이트 알림
      setIsShowVersionUpdateAlarmModal(true);

    } else {
      // 멤버십 알림
      setIsShowIntroduceAlertModal(true);
    }
  }, [applicationVersion]);

  useEffect(() => { // 확인용 바텀시트
    // 구매 완료
    // setIsShowMembershipSubscriptionModal(true);

    // AI 기능제한 팝업
    // setIsAiFunctionLimitationsModal(true);
    // setIsManagerFunctionRestrictionsModal(true);

    // 멤버십 없음
    // setIsShowNonSubscribedModal(true);

    // 결제 해지
    // setIsCancelMembershipPaymentModal(true);
    // setIsMembershipPaymentCancellationWeekModal(true);


  }, []);

  return (
    <View style={styles.container}>

      {/* 검색창 */}

      <View style={[styles.horizontalPadder, styles.searchContainer]}>
        {!!query.length && (
          <Pressable onPress={() => { setQuery(''); setText(''); }} accessibilityRole='button' accessibilityLabel='뒤로가기' accessible>
            <Image style={styles.backButton} source={require('../../assets/images/icBack.png')} />
          </Pressable>
        )}
        <View style={styles.inputWrap}>
          <TextInput
            ref={initialRef}
            style={[styles.textArea]}
            underlineColorAndroid="transparent"
            value={text}
            returnKeyType='done'
            onSubmitEditing={() => handleClickSend(searchSorter)}
            accessible
            accessibilityLabel="검색어 입력창"
            onChangeText={(text) => setText(text)}
            placeholder='찾고 싶은 상품 키워드 또는 링크를 입력해 보세요'
          />
          {!!text.length && (
            <Pressable
              onPress={handleClickReset}
              accessible
              accessibilityLabel="삭제"
              accessibilityRole='button'
            >
              <Image style={styles.resetIcon} source={require('../../assets/images/discover/icReset.png')} />
            </Pressable>
          )}
          <Pressable
            onPress={() => handleClickSend(searchSorter)}
            accessible
            accessibilityLabel="검색하기"
            accessibilityRole='button'
          >
            <Image style={styles.sendIcon} source={require('../../assets/images/discover/icSearch.png')} />
          </Pressable>
        </View>
      </View>

      {isSearching ? (
        <Text style={styles.loading} ref={searchLoadingRef}>검색하신 상품을 로딩중이에요.</Text>
      ) : (
        !!query.length ? (

          // 검색 결과 섹션

          <>
            <View style={styles.searchStatus}>
              <View ref={searchResultRef} accessible accessibilityLabel={`총 ${searchResult?.products.length}건 검색됨`}>
                <Text style={styles.productCount}>총 {searchResult?.products.length}건</Text>
              </View>
              <View style={styles.sorterSelector}>
                {SORTERS.map((sort, idx) => (
                  <Pressable
                    key={`sort-${sort}`}
                    onPress={() => searchProducts({ query: text, page: 1, sort, onLink: router.push, onQuery: () => setQuery(text) })}
                    accessible
                    accessibilityRole='button'
                    accessibilityLabel={sort === searchSorter ? `선택됨 ${SORTER_NAME[idx]}` : SORTER_NAME[idx]}
                  >
                    <Text style={sort === searchSorter ? styles.selectedSorter : styles.sorter}>{SORTER_NAME[idx]}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <ScrollView style={styles.scrollView}>
              {!!searchResult?.products.length && (
                <FlatList
                  scrollEnabled={false}
                  contentContainerStyle={styles.searchList}
                  data={searchResult.products}
                  keyExtractor={(product) => `search-${product.url}`}
                  renderItem={({ item: product }) => <ProductCard product={product} type='search' />}
                  ItemSeparatorComponent={() => <View style={styles.seperator} accessible={false} />}
                // onEndReached={() => handleSearchMore(query)}
                />
              )}
              {!searchResult?.products?.length && <Text style={styles.loading}>검색결과가 없습니다.</Text>}
            </ScrollView>
          </>
        ) : (

          // 메인 상품 섹션

          <ScrollView style={styles.scrollView}>

            {/* order가 0 미만인 로컬(협업) 상품 섹션 */}

            {mainProducts.local.filter(({ order }) => order < 0).sort((a, b) => a.order - b.order).map((section) => (
              <View style={styles.section} key={`discover-main-section-${section.name}-${section.order}`}>
                <Text style={[styles.sectionTitle, styles.horizontalPadder]} accessible accessibilityRole='header'>
                  {section.name}
                </Text>
                <FlatList
                  scrollEnabled={false}
                  contentContainerStyle={[styles.list, styles.horizontalPadder]}
                  data={section.products}
                  keyExtractor={(product) => `random-${product.url}`}
                  ItemSeparatorComponent={() => <View style={styles.seperator} accessible={false} />}
                  renderItem={({ item: product }) => <ProductCard product={product} type='local' />}
                />
              </View>
            ))}

            {/* random(카테고리별 베스트) 상품 섹션 */}

            {!!mainProducts.random.length && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, styles.horizontalPadder]} accessible accessibilityRole='header'>
                  {category}
                </Text>
                <FlatList
                  contentContainerStyle={[styles.list, styles.horizontalPadder]}
                  scrollEnabled={false}
                  data={mainProducts.random.slice(0, length.random)}
                  keyExtractor={(product) => `random-${product.url}`}
                  ItemSeparatorComponent={() => <View style={styles.seperator} accessible={false} />}
                  renderItem={({ item: product }) => <ProductCard ref={focus.random === product.url ? focusRef1 : undefined} product={product} type='bestcategories' />}
                  ListFooterComponentStyle={styles.listFooter}
                  ListFooterComponent={mainProducts.random.length > length.random ? () => (<MoreButton onClick={() => handleClickMore('random')} />) : undefined}
                />
              </View>
            )}

            {/* special(오늘의 특가) 상품 섹션 */}

            {!!mainProducts.special.length && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, styles.horizontalPadder]} accessible accessibilityRole='header'>
                  오늘의 특가
                </Text>
                <FlatList
                  scrollEnabled={false}
                  contentContainerStyle={[styles.list, styles.horizontalPadder]}
                  data={mainProducts.special.slice(0, length.special)}
                  keyExtractor={(product) => `special-${product.url}`}
                  ItemSeparatorComponent={() => <View style={styles.seperator} accessible={false} />}
                  renderItem={({ item: product }) => <ProductCard ref={focus.special === product.url ? focusRef2 : undefined} product={product} type='goldbox' />}
                  ListFooterComponentStyle={styles.listFooter}
                  ListFooterComponent={mainProducts.special.length > length.special ? () => (<MoreButton onClick={() => handleClickMore('special')} />) : undefined}
                />
              </View>
            )}

            {/* order가 0 이상인 로컬(협업) 상품 섹션 */}

            {mainProducts.local.filter(({ order }) => order > 0).sort((a, b) => a.order - b.order).map((section) => (
              <View style={styles.section} key={`discover-main-section-${section.name}-${section.order}`}>
                <Text style={[styles.sectionTitle, styles.horizontalPadder]} accessible accessibilityRole='header'>
                  {section.name}
                </Text>
                <FlatList
                  contentContainerStyle={[styles.list, styles.horizontalPadder]}
                  scrollEnabled={false}
                  data={section.products}
                  keyExtractor={(product) => `random-${product.url}`}
                  ItemSeparatorComponent={() => <View style={styles.seperator} accessible={false} />}
                  renderItem={({ item: product }) => <ProductCard product={product} type='local' />}
                />
              </View>
            ))}
          </ScrollView>
        ))}

      {/* 클립보드 링크 분석 하단 floating 컴포넌트 -> 로직 보류 */}

      {/* {!!clipboardProduct && (
        <Pressable onPress={() => {
            const url = clipboardProduct.url;
            setClipboardProduct('');
            setProductGroup('link');
            router.push(`/discover-detail-main?productUrl=${encodeURIComponent(url)}`);
          }}
            ref={clipboardRef}>
          <View style={styles.clipboardWrap}
            accessibilityRole='button' accessibilityLabel='상품 링크가 복사되었어요. 복사한 링크 상품 상세페이지 설명 보기' accessible
          >
          <View style={styles.clipboardText}>
            <Text style={styles.clipboardTitle} accessible={false}>
              상품 링크가 복사되었어요
            </Text>
            <Text style={styles.clipboardDesc} accessible={false}>
              복사한 링크 상품 상세페이지 설명 보기 &gt;
            </Text>
          </View>
             <Pressable onPress={() => setClipboardProduct('')} accessibilityRole='button' accessibilityLabel='닫기' accessible>
              <Image style={styles.closeButtonImage} source={require('../../assets/images/icClose.png')} />
            </Pressable>
          </View>
        </Pressable>
        )} */}
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  horizontalPadder: {
    paddingHorizontal: 20,
  },
  list: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    flex: 1,
    paddingTop: 50,
  },
  title: {
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 27,
    marginBottom: 13,
  },
  scrollView: {
    paddingVertical: 20,
    flex: 1,
  },
  seperator: {
    height: 12,
    width: 1,
    backgroundColor: 'transparent',
  },
  section: {
    marginBottom: 60,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 23,
  },
  more: {
    marginTop: 12,
    width: '100%',
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    color: '#1E1E1E',
    fontSize: 12,
    lineHeight: 20,
  },
  inputWrap: {
    flex: 1,
    marginHorizontal: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 10,
    borderRadius: 8,
    height: 47,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderColor: '#5F5F5F',
    borderWidth: 1,
    flexDirection: 'row',
  },
  textArea: {
    fontSize: 14,
    flex: 1,
    width: '100%',
  },
  resetIcon: {
    flexShrink: 0,
    marginLeft: 14,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    flexShrink: 0,
    marginLeft: 3,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 24,
    height: 24,
    marginRight: 5,
    flexShrink: 0,
  },
  backText: {
    textDecorationLine: 'underline',
  },
  sorterSelector: {
    marginHorizontal: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  sorter: {
    fontSize: 13,
  },
  selectedSorter: {
    fontWeight: '700',
    fontSize: 13,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  searchList: {
    paddingHorizontal: 20,
    paddingBottom: 44,
  },
  searchItem: {
  },
  searchStatus: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d9d9d9',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productCount: {
    fontWeight: '700'
  },
  loading: {
    paddingHorizontal: 20,
    textAlign: 'center',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
  },
  icon: {
    color: Colors[colorScheme].text.primary,
    marginRight: 9,
  },
  clipboardWrap: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: Colors[colorScheme].buttonBackground.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clipboardText: {
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },
  clipboardTitle: {
    fontSize: 12,
    color: 'white',
    marginBottom: 9,
    fontWeight: '700',
    lineHeight: 14.52,
  },
  clipboardDesc: {
    color: 'white',
    fontSize: 12,
    lineHeight: 14.52,
  },
  closeButtonImage: {
    width: 24,
    height: 24,
  },
  listFooter: {
    width: '100%',
  },
});

