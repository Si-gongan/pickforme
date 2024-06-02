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
    <Pressable onPress={onClick} accessibilityRole='button' accessibilityLabel='상품 더보기' accessible style={styles.more}>
            <Text style={styles.moreText}> 상품 더보기</Text>
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
  const searchLoadingRef = useRef(null);
  const searchResultRef = useRef(null);
  const [category, setCategory] = React.useState('');
  const clipboardProduct = useAtomValue(clipboardProductAtom);
  const setClipboardProduct = useSetAtom(setClipboardProductAtom);

  React.useEffect(() => {
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

  React.useEffect(() => {
    Clipboard.getStringAsync().then((text) => {
      if (!text.length) {
        return;
      }
      setClipboardProduct(text);
    });
  }, []);

  React.useEffect(() => {
    let timer = setTimeout(() => {
      const ref = clipboardRef;
      if (ref.current) {
        const nodeHandle = findNodeHandle(ref.current);
        if (nodeHandle) {
          AccessibilityInfo.setAccessibilityFocus(nodeHandle);
          timer = setTimeout(() => {
            setClipboardProduct('');
          }, 4500);
        }
      }
    }, 500);
    return () => {
      clearTimeout(timer);
    }
  }, []);

  const clipboardRef = useRef(null);
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
  React.useEffect(() => {
    const id = CATEGORIES[Math.floor(CATEGORIES.length * Math.random())];
    setCategory(categoryName[id as keyof typeof categoryName]);
    getMainProducts(id);
  }, [getMainProducts]);
  return (
    <View style={styles.container}>
      <View style={[styles.horizontalPadder,styles.searchContainer]}>
        {!!query.length && (
    <Pressable onPress={() => setQuery('')} accessibilityRole='button' accessibilityLabel='뒤로가기' accessible>
          <Image style={styles.backButton} source={require('../../assets/images/icBack.png')} />
        </Pressable>
        )}
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
            placeholder='찾고 싶은 상품 키워드 또는 링크를 입력해 보세요'
          />
          {!!text.length && (
          <Pressable
            onPress={handleClickReset}
            accessible
            accessibilityLabel="비우기"
            accessibilityRole='button'
          >
            <Image style={styles.resetIcon} source={require('../../assets/images/discover/icReset.png')} />
          </Pressable>
          )}
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
          <Text style={styles.loading} ref={searchLoadingRef}>검색하신 상품을 로딩중이에요.</Text>
      ) : (
      !!query.length ? (
              <ScrollView style={styles.scrollView}
                ref={searchResultRef}>
        {!!searchResult?.products.length && (
                <FlatList
                scrollEnabled={false}
          contentContainerStyle={styles.searchList}
          data={searchResult.products}
          keyExtractor={(product) => `search-${product.id}`}
          renderItem={({ item: product }) => <ProductCard product={product} />}
          ItemSeparatorComponent={() => <View style={styles.seperator} accessible={false} />}
          onEndReached={() => handleSearchMore(query)}
        />
        )}
        {!isSearching && !searchResult?.products?.length && <Text style={styles.loading}>검색결과가 없습니다.</Text>}
        </ScrollView>
      ) : (
      <ScrollView style={styles.scrollView}>
      {mainProducts.local.filter(({ order }) => order < 0).sort((a,b) => a.order - b.order).map((section) => (
        <View style={styles.section} key={`discover-main-section-${section.name}-${section.order}`}>
          <Text style={[styles.sectionTitle, styles.horizontalPadder]} accessible accessibilityRole='header'>
            {section.name}
          </Text>
          <FlatList
                scrollEnabled={false}
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
        contentContainerStyle={[styles.list, styles.horizontalPadder]}
                scrollEnabled={false}
        data={mainProducts.random.slice(0,length.random)}
        keyExtractor={(product) => `random-${product.id}`}
        ItemSeparatorComponent={() => <View style={styles.seperator} accessible={false} />}
        renderItem={({ item: product }) => <ProductCard ref={focus.random === product.id ? focusRef1 : undefined} product={product} />}
        ListFooterComponentStyle={styles.listFooter}
        ListFooterComponent={mainProducts.random.length > length.random ? () => (<MoreButton onClick={() => handleClickMore('random')} />) : undefined}
      />
      </View>
      )}

      {!!mainProducts.special.length && (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.horizontalPadder]} accessible accessibilityRole='header'>
          오늘의 특가
        </Text>
     <FlatList
                scrollEnabled={false}
        contentContainerStyle={[styles.list, styles.horizontalPadder]}
        data={mainProducts.special.slice(0,length.special)}
        keyExtractor={(product) => `special-${product.id}`}
        ItemSeparatorComponent={() => <View style={styles.seperator} accessible={false} />}
        renderItem={({ item: product }) => <ProductCard ref={focus.random === product.id ? focusRef2 : undefined} product={product} />}
        ListFooterComponentStyle={styles.listFooter}
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
            contentContainerStyle={[styles.list, styles.horizontalPadder]}
                scrollEnabled={false}
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
            const url = clipboardProduct.url;
            setClipboardProduct('');
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
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  searchList: {
    paddingHorizontal: 20,
    marginLeft: 7,
    marginRight: 7,
    paddingBottom: 44,
  },
  searchItem: {
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

