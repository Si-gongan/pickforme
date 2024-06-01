import React from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { ActivityIndicator, Image, TextInput, Pressable, FlatList, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import useCheckLogin from '../hooks/useCheckLogin';
import Colors from '../constants/Colors';
import { searchResultAtom, wishProductsAtom, mainProductsAtom, productDetailAtom, getProductDetailReviewAtom, getProductDetailReportAtom, getProductDetailAtom, loadingStatusAtom } from '../stores/discover/atoms';
import { 
  requestBottomSheetAtom
  } from '../stores/request/atoms';
import { Product } from '../stores/discover/types';
import { pushBottomSheetAtom } from '../stores/layout/atoms';
import { requestsAtom } from '../stores/request/atoms';


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
  [TABS.CAPTION]: '상품 이미지',
  [TABS.REPORT]: '자세한 설명',
  [TABS.REVIEW]: '리뷰 요약',
  answer: '매니저 답변',
} as const;

const loadingMessages = {
  [TABS.CAPTION]: '상품의 이미지 설명을 생성중이에요. ',
  [TABS.REPORT]: '상품의 자세한 설명을 생성중이에요. ',
  [TABS.REVIEW]: '상품의 리뷰를 AI가 요약중이에요.',
  answer: '매니저가 질문을 확인중이에요. 2시간 내로 답변이 도착할 거예요.',
} as const;


export default function DiscoverScreen() {
  const { productId, productUrl: productUrlBase } = useLocalSearchParams();
  const productUrl = productUrlBase ? decodeURIComponent(`${productUrlBase}`) : undefined;
  const router = useRouter();
  const productDetail = useAtomValue(productDetailAtom);
  const mainProducts = useAtomValue(mainProductsAtom);
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const getProductDetail = useSetAtom(getProductDetailAtom);
  const getProductDetailReport = useSetAtom(getProductDetailReportAtom);
    const setRequestBottomSheet = useSetAtom(requestBottomSheetAtom);
  const getProductDetailReview = useSetAtom(getProductDetailReviewAtom);
  const searchResult = useAtomValue(searchResultAtom);
  const [wishlist,setWishlist] = useAtom(wishProductsAtom);
  const requests = useAtomValue(requestsAtom);
  const request = requests.find(request => `${request.product.url}` === productUrl || `${request.product.id}` === productId);
  const already = wishlist.find((wishProduct) => `${wishProduct.url}` === productUrl || `${wishProduct.id}` === productId);
  const product = (request?.product) || searchResult?.products.find((searchItem) => searchItem.url === productUrl || `${searchItem.id}` === `${productId}`) || [...(mainProducts.local.map(section => section.products).flat()), ...mainProducts.special, ...mainProducts.random, ].find(({ id }) => `${id}` === `${productId}`) || already;

  const [tab, setTab] = React.useState<TABS | 'answer'>(TABS.CAPTION);
  const loadingStatus = useAtomValue(loadingStatusAtom);
  React.useEffect(() => {
    if (product) {
      getProductDetail(product);
    }
  }, [getProductDetail, productId]);
  const handleClickBuy = async () => {
    if (!product) {
      return;
    }
    await WebBrowser.openBrowserAsync(product.url);
  }
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
    const pushBottomSheet = useSetAtom(pushBottomSheetAtom);

  const handleClickRequest = useCheckLogin(() => {
    if (!product) {
      return;
    }
    setRequestBottomSheet(product);
  });

  const hasDetail = productDetail?.product?.url !== undefined && product?.url !== undefined && `${productDetail?.product?.url}` === `${product?.url}`;
  console.log({ hasDetail, product, productDetail });
  const handlePressTab = (nextTab: (TABS | 'answer')) => {
    if (nextTab === 'answer') {
    setTab(nextTab);
    return;
    }
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
      <View>
        <View style={styles.inner}>
        <Text style={styles.name}>
          {product.name}
        </Text>
        <View style={styles.priceWrap}>
          {productDetail?.product?.discountRate !== undefined && product.price !== productDetail.product.discountRate && (
            <Text style={styles.discountRate}>
              {numComma(productDetail.product.discountRate)}
            </Text>
          )}
            <Text style={styles.price}>
              {numComma(product.price || 0)}원
            </Text>
          {productDetail?.product?.originPrice !== undefined && product.price !== productDetail.product.originPrice && (
            <Text style={styles.originPrice}>
              {numComma(productDetail.product.originPrice)}
            </Text>
          )}
        </View>
              {hasDetail && productDetail.product && (
          <View style={styles.table}>
            <View style={styles.tableList}>
              <View style={styles.tableRow} accessible>
                <Text style={styles.tableHeader}>
                   리뷰 개수
                </Text>
                <Text style={styles.tableItem}>
                  {productDetail.product.reviews || 0} 개
                </Text>
              </View>
              <View style={styles.tableRow} accessible>
                <Text style={styles.tableHeader}>
                  평점
                </Text>
                <Text style={styles.tableItem}>
                  {Math.floor(productDetail.product.ratings / 20 * 10) / 10} 점
                </Text>
              </View>
            </View>
          </View>
       )}
        </View>
       <View style={styles.tabWrap}>
        {[...Object.values(TABS), ...(request?.product ? ['answer' as const] : [])].map((TAB) => (
          <View style={styles.tab} key={`Requests-Tab-${TAB}`}>
            <Button
              style={[styles.tabButton, tab === TAB && styles.tabButtonActive]}
              textStyle={[styles.tabButtonText, tab === TAB && styles.tabButtonTextActive]}
              variant='text'
              title={tabName[TAB]}
              size='medium'
              color={tab === TAB ? 'primary' : 'tertiary'}
              onPress={() => handlePressTab(TAB)}
              accessibilityLabel={tabName[TAB]}
            />
          </View>
        ))}
      </View>
      {tab === 'answer' ? (
       <View style={styles.detailWrap}>
         <Text>{request?.answer?.text || loadingMessages['answer']}</Text>
       </View>
      ) : (
      <>
        {(loadingStatus[tab] <= 1 || !hasDetail) ? (
          <View style={styles.detailWrap}><ActivityIndicator style={styles.loadingIcon} /><Text>{loadingMessages[tab]}</Text></View>
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
      </>
      )}
      </View>
      )}
      </ScrollView>
      <View style={styles.buttonWrap}>
      {['1001','1002','1003'].includes(`${productId}`) ? (
      <View style={styles.buttonOuter}>
        <Button title='대리구매 요청하기' onPress={handleClickBuy2} style={styles.button} color='tertiary' size='small' />
      </View>
      ) : (
      <>
      <View style={styles.buttonOuter}>
        <Button title='구매하러 가기' onPress={handleClickBuy} style={styles.button} size='small' />
      </View>
      <View style={styles.buttonOuter}>
        <Button title='매니저에게 물어보기' onPress={request ? handleClickBuy2 : handleClickRequest} style={[styles.button, styles.button2]} color='tertiary' size='small' />
      </View>
      </>
      )}
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
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 11,
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  discountRate: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  originPrice: {
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
    marginTop: 31,
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
  },
  tab: {
    flex: 1,
  },
  tabButton: {
    paddingVertical: 16,
    flex: 1,
    flexDirection: 'row',
    borderRadius: 0,
    borderBottomWidth: 1,
    borderColor: '#EFEFEF',
  },
  tabButtonActive: {
    borderBottomColor: Colors[colorScheme].text.primary,
    borderBottomWidth: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 17,
  },
  tabButtonTextActive: {
    color: Colors[colorScheme].text.primary,
    fontWeight: '700',
  },
  detailWrap: {
    padding: 28,
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
    borderRadius: 4,
    height: 50,
  },
  button2: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors[colorScheme].buttonBackground.primary,
  },
  heartIcon: {
    width: 24,
    height: 22,
  },
  buttonOuter: {
    flex: 1,
  },
  loadingIcon: {
  },
});
