import React from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { Image, TextInput, Pressable, FlatList, ScrollView, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';

import Colors from '../../constants/Colors';
import { searchedProductsAtom, searchProductsAtom, getMainProductsAtom, mainProductsAtom } from '../../stores/discover/atoms';

import Button from '../../components/Button';
import { Text, View } from '../../components/Themed';
import { formatDate } from '../../utils/common';
import useColorScheme, { ColorScheme } from '../../hooks/useColorScheme';
import ProductCard from '../../components/DiscoverProduct';
import SearchProductCard from '../../components/SearchProduct';

const MoreButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
   return     (
    <Pressable onPress={onClick}>
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
  const searchedProducts = useAtomValue(searchedProductsAtom);

  const styles = useStyles(colorScheme);
  const [query, setQuery] = React.useState('');
  const [length, setLength] = React.useState({
    special: 5,
    random: 5,
  });
  const [text, setText ] =React.useState('');
  const handleClickSend = () => {
    searchProducts(text);
    setQuery(text);
  }

  const handleClickMore = (key: keyof typeof length) => {
    const nextNum = Math.min(mainProducts[key].length, length[key] + 5);
    setLength({
      ...length,
      [key]: nextNum,
    });
  }

  React.useEffect(() => {
    getMainProducts();
  }, [getMainProducts]);

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
        <Text style={styles.title}>탐색</Text>
        )}
      </View>
      <ScrollView style={styles.scrollView}>
      <View style={[styles.section, styles.horizontalPadder]}>
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
            placeholder='상품이름'
          />
          <Pressable
            onPress={handleClickSend}
            accessible
            accessibilityLabel="검색하기"
          >
            <Image style={styles.sendIcon} source={require('../../assets/images/discover/icSearch.png')} />
          </Pressable>
        </View>
      </View>
      {!!query.length ? (
      <>
      {searchedProducts === undefined ? (
      <Text style={styles.loading}>검색중입니다.</Text>
      ) : (!!searchedProducts.length ? (
        <>
              <FlatList
                      scrollEnabled={false}
                       columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.searchList}
        data={searchedProducts}
        numColumns={2}
        keyExtractor={(product) => `search-${product.id}`}
        renderItem={({ item: product }) => <SearchProductCard product={product} />}
        ItemSeparatorComponent={() => <View style={styles.seperatorRow} accessible={false} />}
      />

        </>
      ) : <Text>검색결과가 없습니다.</Text>)}
      </>
      ) : (
      <>
      {!!mainProducts.random.length && (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.horizontalPadder]}>
          {mainProducts.random[1].categoryName}
        </Text>
      <FlatList
        horizontal
        contentContainerStyle={[styles.list, styles.horizontalPadder]}
        data={mainProducts.random.slice(0,length.random)}
        keyExtractor={(product) => `random-${product.productId}`}
        ItemSeparatorComponent={() => <View style={styles.seperator} accessible={false} />}
        renderItem={({ item: product }) => <ProductCard product={product} />}
        ListFooterComponent={mainProducts.random.length > length.random ? () => (<MoreButton onClick={() => handleClickMore('random')} />) : undefined}
      />
      </View>
      )}
      {!!mainProducts.special.length && (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.horizontalPadder]}>
          오늘의 특가 상품
        </Text>
     <FlatList
        horizontal
        contentContainerStyle={[styles.list, styles.horizontalPadder]}
        data={mainProducts.special.slice(0,length.special)}
        keyExtractor={(product) => `special-${product.productId}`}
        ItemSeparatorComponent={() => <View style={styles.seperator} accessible={false} />}
        renderItem={({ item: product }) => <ProductCard product={product} />}
        ListFooterComponent={mainProducts.special.length > length.special ? () => (<MoreButton onClick={() => handleClickMore('special')} />) : undefined}
      />
      </View>
      )}
      </>
      )}
      </ScrollView>
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
    paddingVertical: 20,
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
    marginTop: 35,
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
    width: '100%',
    flex: 1,
  },
  textArea: {
    flex: 1,
    fontSize: 14,
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
    backButton: { width: 89 },
  backText: {
    textDecorationLine: 'underline',
  },
  searchList: {
    paddingHorizontal: 20,
    marginLeft: 7,
    marginRight: 7,
    flex: 1,
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
});
