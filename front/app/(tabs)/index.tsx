import React from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { Image, TextInput, Pressable, FlatList, ScrollView, View as ViewBase, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import Colors from '../../constants/Colors';
import { setClipboardProductAtom, clipboardProductAtom, isSearchingAtom, searchMoreAtom, searchResultAtom, searchProductsAtom, getMainProductsAtom, mainProductsAtom } from '../../stores/discover/atoms';

import Button from '../../components/Button';
import { Text, View } from '../../components/Themed';
import { formatDate } from '../../utils/common';
import useColorScheme, { ColorScheme } from '../../hooks/useColorScheme';
import ProductCard from '../../components/DiscoverProduct';
import SearchProductCard from '../../components/SearchProduct';

import DiscoverIcon from '../../assets/images/tabbar/index.svg';

import { useFocusEffect } from '@react-navigation/core';
import { useRef } from 'react';
import { Text as TextBase, AccessibilityInfo, findNodeHandle } from 'react-native';
const categoryName = {
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
const CATEGORIES = [
  '1001',
  '1002',
  '1010',
  '1011',
  '1012',
  '1013',
  '1014',
  '1015',
  '1016',
  '1017',
  '1018',
  '1019',
  '1020',
  '1021',
  '1024',
  '1025',
  '1026',
  '1029',
  '1030',
];


const MoreButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
   return     (
    <Pressable onPress={onClick} accessibilityRole='button' accessibilityLabel='더보기' accessible>
          <View
            style={styles.more}
          >
            <View
              style={styles.moreButton}
            >
              <Image style={styles.moreButtonImage} source={require('../../assets/images/discover/icArrowRight.png')} />
            </View>
            <Text>더보기</Text>
          </View>
          </Pressable>
          );
}

export default function DiscoverScreen() {
  const router = useRouter();
  const getMainProducts = useSetAtom(getMainProductsAtom);
  const mainProducts = useAtomValue(mainProductsAtom);
  const colorScheme = useColorScheme();
  const searchProducts = useSetAtom(searchProductsAtom);
  const searchResult = useAtomValue(searchResultAtom);
  const handleSearchMore = useSetAtom(searchMoreAtom);
  const isSearching = useAtomValue(isSearchingAtom);
  const [category, setCategory] = React.useState('');
  const clipboardProduct = useAtomValue(clipboardProductAtom);
  const setClipboardProduct = useSetAtom(setClipboardProductAtom);
  React.useEffect(() => {
    Clipboard.getStringAsync().then((text) => {
      if (!text.length) {
        return;
      }
      setClipboardProduct(text);
    });
  }, []);

  const focusRef1 = useRef<ViewBase>(null);
  const focusRef2 = useRef<ViewBase>(null);

  const styles = useStyles(colorScheme);
  const [query, setQuery] = React.useState('');

  const [focus, setFocus] = React.useState({
    special: 0,
    random: 0,
  });
  const [length, setLength] = React.useState({
    special: 5,
    random: 5,
  });
  const [text, setText ] =React.useState('');
  const handleClickSend = () => {
    searchProducts({ query: text, page: 1, onLink: router.push, onQuery: () => setQuery(text) });
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
      [key]: mainProducts[key][nextFocus].id,
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
  const headerTitleRef = useRef<TextBase>(null);
  useFocusEffect(
  React.useCallback(
    () => {
      if (headerTitleRef.current) {
        const nodeHandle = findNodeHandle(headerTitleRef.current);
        if (nodeHandle) {
          AccessibilityInfo.setAccessibilityFocus(nodeHandle);
        }
      }
    }, []),
  );
  React.useEffect(() => {
    const id = CATEGORIES[Math.floor(CATEGORIES.length * Math.random())];
    setCategory(categoryName[id as keyof typeof categoryName]);
    getMainProducts(id);
  }, [getMainProducts]);
  console.log(isSearching);
  return (
    <View style={styles.container}>
      <View style={styles.horizontalPadder}>
        {!!query.length ? (
              <Button
        title='뒤로가기'
        color='tertiary'
        size='small'
        onPress={() => setQuery('')}
        style={styles.backButton}
        textStyle={styles.backText}
        />
        ) : (
        <View style={styles.header}>
        <DiscoverIcon style={styles.icon} />
        <Text style={styles.title} accessibilityRole='header' ref={headerTitleRef}>탐색</Text>
      </View>
        )}
      </View>
      <View style={styles.horizontalPadder}>
        <View style={styles.inputWrap}>
          <TextInput
            style={[styles.textArea]}
            underlineColorAndroid="transparent"
            value={text}
            returnKeyType='done'
            onSubmitEditing={() => handleClickSend()}
            accessible
            accessibilityLabel="검색어 입력창"
            onChangeText={(text) => setText(text)}
            placeholder='상품을 검색하세요'
          />
          <Pressable
            onPress={handleClickSend}
            accessible
            accessibilityLabel="검색하기"
            accessibilityRole='button'
          >
            <Image style={styles.sendIcon} source={require('../../assets/images/discover/icSearch.png')} />
          </Pressable>
        </View>
      </View>
      {isSearching ? (
          <Text style={styles.loading}>검색중입니다.</Text>
      ) : (
      !!query.length ? (
        <>
        {!!searchResult?.products.length && (
                <FlatList
                         columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.searchList}
          data={searchResult.products}
          numColumns={2}
          keyExtractor={(product) => `search-${product.id}`}
          renderItem={({ item: product }) => <SearchProductCard product={product} />}
          ItemSeparatorComponent={() => <View style={styles.seperatorRow} accessible={false} />}
          onEndReached={() => handleSearchMore(query)}
        />
        )}
        {!isSearching && !searchResult?.products?.length && <Text style={styles.loading}>검색결과가 없습니다.</Text>}
        </>
      ) : (
      <ScrollView style={styles.scrollView}>
      {mainProducts.local.filter(({ order }) => order < 0).sort((a,b) => a.order - b.order).map((section) => (
        <View style={styles.section} key={`discover-main-section-${section.name}-${section.order}`}>
          <Text style={[styles.sectionTitle, styles.horizontalPadder]} accessible accessibilityRole='header'>
            {section.name}
          </Text>
          <FlatList
            horizontal
            contentContainerStyle={[styles.list, styles.horizontalPadder]}
            data={section.products}
            keyExtractor={(product) => `random-${product.id}`}
            ItemSeparatorComponent={() => <View style={styles.seperator} accessible={false} />}
            renderItem={({ item: product }) => <ProductCard product={product} />}
          />
        </View>
      ))}

      
      {!!mainProducts.random.length && (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.horizontalPadder]} accessible accessibilityRole='header'>
          {category}
        </Text>
      <FlatList
        horizontal
        contentContainerStyle={[styles.list, styles.horizontalPadder]}
        data={mainProducts.random.slice(0,length.random)}
        keyExtractor={(product) => `random-${product.id}`}
        ItemSeparatorComponent={() => <View style={styles.seperator} accessible={false} />}
        renderItem={({ item: product }) => <ProductCard ref={focus.random === product.id ? focusRef1 : undefined} product={product} />}
        ListFooterComponent={mainProducts.random.length > length.random ? () => (<MoreButton onClick={() => handleClickMore('random')} />) : undefined}
      />
      </View>
      )}

      {!!mainProducts.random.length && (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.horizontalPadder]} accessible accessibilityRole='header'>
          오늘의 특가
        </Text>
     <FlatList
        horizontal
        contentContainerStyle={[styles.list, styles.horizontalPadder]}
        data={mainProducts.special.slice(0,length.special)}
        keyExtractor={(product) => `special-${product.id}`}
        ItemSeparatorComponent={() => <View style={styles.seperator} accessible={false} />}
        renderItem={({ item: product }) => <ProductCard ref={focus.random === product.id ? focusRef2 : undefined} product={product} />}
        ListFooterComponent={mainProducts.special.length > length.special ? () => (<MoreButton onClick={() => handleClickMore('special')} />) : undefined}
      />
      </View>
      )}  

       {mainProducts.local.filter(({ order }) => order > 0).sort((a,b) => a.order - b.order).map((section) => (
        <View style={styles.section} key={`discover-main-section-${section.name}-${section.order}`}>
          <Text style={[styles.sectionTitle, styles.horizontalPadder]} accessible accessibilityRole='header'>
            {section.name}
          </Text>
          <FlatList
            horizontal
            contentContainerStyle={[styles.list, styles.horizontalPadder]}
            data={section.products}
            keyExtractor={(product) => `random-${product.id}`}
            ItemSeparatorComponent={() => <View style={styles.seperator} accessible={false} />}
            renderItem={({ item: product }) => <ProductCard product={product} />}
          />
        </View>
      ))}
      </ScrollView>
      ))}
        {!!clipboardProduct && (
        <Pressable onPress={() => {
            setClipboardProduct('');
              router.push(`/discover-detail?productId=${clipboardProduct.id}`);
          }} accessibilityRole='button' accessibilityLabel='클립보드 상품 검색' accessible>
          <View style={styles.clipboardWrap}>
          <View style={styles.clipboardText}>
            <Text style={styles.clipboardTitle}>
              상품 링크가 복사되었어요
            </Text>
            <Text style={styles.clipboardDesc}>
              복사한 링크 상품 상세페이지 설명 보기 &gt;
            </Text>
          </View>
             <Pressable onPress={() => setClipboardProduct('')} accessibilityRole='button' accessibilityLabel='클립보드 닫기' accessible>
              <Image style={styles.closeButtonImage} source={require('../../assets/images/icClose.png')} />
            </Pressable>
          </View>
        </Pressable>
        )}
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
  seperatorRow: {
    height: 15,
    width: 1,
    backgroundColor: 'transparent',
  },
  seperator: {
    height: 1,
    width: 13,
    backgroundColor: 'transparent',
  },
  section: {
    marginBottom: 44,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 23,
  },
  more: {
    flex: 1,
    gap: 7,
    marginLeft: 30,
  },
  moreButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F1F1F1',
    borderRadius: 36,
    borderWidth: 1,
    borderColor: Colors[colorScheme].text.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonImage: {
    width: 14,
    height: 14,
  },
  moreText: {
    fontSize: 8,
    lineHeight: 11,
  },
  inputWrap: {
    marginBottom: 10,
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: 45,
    height: 47,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderColor: Colors[colorScheme].text.primary,
    borderWidth: 1,
    flexDirection: 'row',
  },
  textArea: {
    fontSize: 14,
    flex: 1,
    width: '100%',
  },
  sendIcon: {
    flexShrink: 0,
    marginLeft: 14,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 89,
    marginBottom: 9,
  },
  backText: {
    textDecorationLine: 'underline',
  },
  searchList: {
    paddingHorizontal: 20,
    marginLeft: 7,
    marginRight: 7,
  },
  searchItem: {
  },
  columnWrapper: {
    gap: 14,
    marginLeft: -7,
    paddingRight: 7,
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
  }
});

