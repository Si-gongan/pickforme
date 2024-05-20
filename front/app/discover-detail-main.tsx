import React from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { Image, TextInput, Pressable, FlatList, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import Colors from '../constants/Colors';
import { wishProductsAtom, mainProductsAtom, productDetailAtom, getProductDetailReviewAtom, getProductDetailReportAtom, getProductDetailAtom, loadingStatusAtom } from '../stores/discover/atoms';
import { Product } from '../stores/discover/types';

import Button from '../components/Button';
import { Text, View } from '../components/Themed';
import { numComma } from '../utils/common';
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';

    
enum TABS {
  CAPTION = 'caption',
  REPORT = 'report',
  REVIEW = 'review',
};


const tabName = {
  [TABS.CAPTION]: '이미지 설명',
  [TABS.REPORT]: '상세페이지 설명',
  [TABS.REVIEW]: '리뷰 요약',
}

const loadingMessages = {
  [TABS.CAPTION]: 'AI가 상품 이미지를 분석하고 있어요.',
  [TABS.REPORT]: '쿠팡의 상품 상세페이지를 요약하고 있어요.',
  [TABS.REVIEW]: '쿠팡의 리뷰 10개를 ai가 요약하고 있어요.',
}


export default function DiscoverScreen() {
  const { productId } = useLocalSearchParams();
  const router = useRouter();
  const productDetail = useAtomValue(productDetailAtom);
  const mainProducts = useAtomValue(mainProductsAtom);
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const getProductDetail = useSetAtom(getProductDetailAtom);
  const getProductDetailReport = useSetAtom(getProductDetailReportAtom);
  const getProductDetailReview = useSetAtom(getProductDetailReviewAtom);
  const product = [...(mainProducts.local.map(section => section.products).flat()), ...mainProducts.special, ...mainProducts.random, ].find(({ id }) => `${id}` === `${productId}`);

  const [tab, setTab] = React.useState<TABS>(TABS.CAPTION);
  const [wishlist,setWishlist] = useAtom(wishProductsAtom);
  const loadingStatus = useAtomValue(loadingStatusAtom);
  React.useEffect(() => {
    if (product) {
      getProductDetail(product);
    }
  }, [getProductDetail, product]);
  const handleClickBuy = async () => {
    if (!product) {
      return;
    }
    await WebBrowser.openBrowserAsync(product.url);
  }
  const already = wishlist.find((wishProduct) => wishProduct.id === product?.id);
  const handleClickWish = async () => {
    if (product) {
      if (already) {
        setWishlist(wishlist.filter((wishProduct) => wishProduct !== already));
      } else {
        setWishlist([...wishlist, product]);
      }
    }
  }
  const handleClickBuy2 = async () => {
    if (!product) {
      return;
    }
    await WebBrowser.openBrowserAsync('https://pf.kakao.com/_csbDxj');
  }
  const handleClickRequest = () => {
    if (!product) {
      return;
    }
    router.push({ pathname: '/research', params: { link: encodeURIComponent(product.url) }});
  }

  const hasDetail = !!productDetail?.product?.id && !!product?.id && `${productDetail?.product?.id}` === `${product?.id}`;
  const handlePressTab = (nextTab: TABS) => {
    if (loadingStatus[nextTab] === 0 && !productDetail?.[nextTab] && product) {
      if (nextTab === TABS.REPORT) {
        getProductDetailReport(product);
      }
      if (nextTab === TABS.REVIEW) {
        getProductDetailReview(product);
      }
    }
    setTab(nextTab);
  }
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
      {!!product && (
      <View style={styles.inner}>
        <Image style={styles.image} source={{ uri: product.thumbnail }} />
        <Text style={styles.name}>
          {product.name}
        </Text>
          <Text style={styles.price}>
            {numComma(product.price || 0)}원
          </Text>
        <View style={styles.seperator} />
          <View style={styles.table}>
            <View style={styles.tableList}>
              <Text style={[styles.tableHeader, styles.tableTitle]}>
                상품 정보
              </Text>
              {hasDetail && productDetail.product && (
              <>
              <View style={styles.tableRow} accessible>
                <Text style={styles.tableHeader}>
                  평점
                </Text>
                <Text style={styles.tableItem}>
                  {Math.floor(productDetail.product.ratings / 20 * 10) / 10} 점
                </Text>
              </View>
              <View style={styles.tableRow} accessible>
                <Text style={styles.tableHeader}>
                   리뷰 개수
                </Text>
                <Text style={styles.tableItem}>
                  {productDetail.product.reviews || 0} 개
                </Text>
              </View>
              </>
              )}
            </View>
          </View>
        <View style={styles.seperator} />
         <View style={styles.tabWrap}>
        {Object.values(TABS).map((TAB) => (
          <View style={styles.tab} key={`Requests-Tab-${TAB}`}>
            <Button
              style={styles.tabButton}
              title={tabName[TAB]}
              size='medium'
              color={tab === TAB ? 'primary' : 'tertiary'}
              onPress={() => handlePressTab(TAB)}
              accessibilityLabel={tabName[TAB]}
            />
          </View>
        ))}
      </View>
        {(loadingStatus[tab] <= 1 || !hasDetail) ? (
          <View style={styles.detailWrap}><Text>{loadingMessages[tab]}</Text></View>
        ) : (!!productDetail?.[tab] ? (
          <>
              {tab !== 'review' ? (
                <View style={styles.detailWrap}>
                  <Text>{productDetail?.[tab]}</Text>
                </View>
              ) : (
                <>
                  {hasDetail && !productDetail?.[tab]?.pros?.length
                  && !productDetail?.[tab]?.cons?.length && (
                    <View style={styles.detailWrap}>
                      <Text>등록된 리뷰가 없습니다.</Text>
                    </View>
                  )}
                  {productDetail?.[tab]?.pros?.length !== 0 && (
                    <View style={styles.detailWrap} accessible={true}>
                      <Text style={styles.reviewListTitle}>
                        긍정 리뷰 요약
                      </Text>
                      {productDetail?.[tab]?.pros.map((row, i) => (
                        <View style={styles.reviewListRow} key={`discover-detail-${product.id}-pros-row-${i}`}>
                          <Text accessible={false}>{`\u2022`}</Text>
                          <Text style={styles.reviewListRowText}>{row}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {productDetail?.[tab]?.cons?.length !== 0 && (
                    <View style={styles.detailWrap} accessible={true}>
                      <Text style={styles.reviewListTitle}>
                        부정 리뷰 요약
                      </Text>
                      {productDetail?.[tab]?.cons.map((row, i) => (
                        <View style={styles.reviewListRow} key={`discover-detail-${product.id}-cons-row-${i}`}>
                          <Text accessible={false}>{`\u2022`}</Text>
                          <Text style={styles.reviewListRowText}>{row}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
           </>
          ): (
            <View style={styles.detailWrap}>
              <Text>정보를 불러오는데 실패했습니다.</Text>
            </View>
          ))}
      </View>
      )}
      </ScrollView>
      <View style={styles.buttonWrap}>
      {['1001','1002','1003'].includes(`${productId}`) ? (
      <View style={styles.buttonOuter}>
        <Button title='대리구매 요청하기' onPress={handleClickBuy2} style={styles.button} color='tertiary' size='small' />
      </View>
      ) : (
      <View style={styles.buttonOuter}>
        <Button title='매니저에게 상품 설명 받기' onPress={handleClickRequest} style={styles.button} color='tertiary' size='small' />
      </View>
      )}
      <View style={styles.buttonOuter}>
        <Button title='구매하기' onPress={handleClickBuy} style={styles.button} size='small' />
      </View>
        {already ? ( 
          <Pressable
            onPress={handleClickWish}
            accessible
            accessibilityLabel="위시리스트 제거"
            accessibilityRole='button'
          >
            <Image style={styles.heartIcon} source={require('../assets/images/discover/icHeartFill.png')} />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleClickWish}
            accessible
            accessibilityLabel="위시리스트 추가"
            accessibilityRole='button'
          >
            <Image style={styles.heartIcon} source={require('../assets/images/discover/icHeart.png')} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    paddingTop: 20,
  },
  inner: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  scrollView: {
    flex: 1,
  },
  image: {
    marginBottom: 32,
    flex: 1,
    aspectRatio: 1,
    resizeMode: 'contain',
    width: '100%',
    backgroundColor: Colors[colorScheme].borderColor.tertiary,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 21,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
  },
  originalPrice: {
    color: '#576084',
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  seperator: {
    width: '100%',
    backgroundColor: Colors[colorScheme].borderColor.primary,
    height: 1,
    marginVertical: 25,
  },
  table: {
    paddingHorizontal: 14,
    flexDirection: 'column',
  },
  tableTitle: {
    marginBottom: 10,
  },
  tableList: {
    gap: 8,
    flexDirection: 'column',
  },
  tableRow: {
    gap: 43,
    flexDirection: 'row',
  },
  tableHeader: {
    width: 65,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  tableItem: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    flexGrow: 1,
  },
 tabWrap: {
    flexDirection: 'row',
    alignContent: 'stretch',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  tab: {
    flex: 1,
  },
  tabButton: {
    flexDirection: 'row',
  },
  detailWrap: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors[colorScheme].borderColor.tertiary,
    padding: 20,
    marginTop: 26,
  },
  reviewListTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 13,
  },
  reviewListRow: {
    flexDirection: 'row',
  },
  reviewListRowText: {
    lineHeight: 24,
    fontSize: 14,
  },
  buttonWrap: {
    gap: 16,
    paddingTop: 15,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: Colors[colorScheme].borderColor.tertiary,
    alignContent: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
  },
  button: {
    borderRadius: 10,
    height: 50,
  },
  heartIcon: {
    width: 24,
    height: 22,
  },
  buttonOuter: {
    flex: 1,
  },
});
