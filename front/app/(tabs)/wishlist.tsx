import React from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { Image, TextInput, Pressable, FlatList, ScrollView, View as ViewBase, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { getRequestsAtom, requestsAtom } from '../../stores/request/atoms';

import useCheckLogin from '../../hooks/useCheckLogin';
import { wishProductsAtom } from '../../stores/discover/atoms';
import { Product } from '../../stores/discover/types';
import Colors from '../../constants/Colors';
import Button from '../../components/Button';
import { Text, View } from '../../components/Themed';
import { formatDate } from '../../utils/common';
import useColorScheme, { ColorScheme } from '../../hooks/useColorScheme';
import ProductCard from '../../components/DiscoverProduct';

import DiscoverIcon from '../../assets/images/tabbar/requests.svg';

import { useFocusEffect } from '@react-navigation/core';
import { useRef } from 'react';
import { Text as TextBase, AccessibilityInfo, findNodeHandle } from 'react-native';

enum TABS {
  PRODUCT = 'PRODUCT',
  REQUEST = 'REQUEST',
};

const tabName = {
  [TABS.PRODUCT]: '찜한 상품',
  [TABS.REQUEST]: '매니저에게 문의한 상품',
}


export default function DiscoverScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const wishProducts = useAtomValue(wishProductsAtom);
  const headerTitleRef = useRef<TextBase>(null);
  const [tab, setTab] = React.useState<TABS>(TABS.PRODUCT);

  const getRequests = useSetAtom(getRequestsAtom);
  const requests = useAtomValue(requestsAtom);

  React.useEffect(() => {
    if (tab === TABS.REQUEST) {
      getRequests();
    }
  }, [getRequests, tab]);

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

  const handleClickRequest = useCheckLogin(() => setTab(TABS.REQUEST));
  return (
    <View style={styles.container}>
      <View style={styles.horizontalPadder}>
        <View style={styles.header}>
        <DiscoverIcon style={styles.icon} />
        <Text style={styles.title} accessibilityRole='header' ref={headerTitleRef}>위시리스트</Text>
        </View>
      </View>
             <View style={styles.tabWrap}>
        {Object.values(TABS).map((TAB) => (
          <View style={styles.tab} key={`Wish-Tab-${TAB}`}>
            <Button
              style={[styles.tabButton, tab === TAB && styles.tabButtonActive]}
              textStyle={[styles.tabButtonText, tab === TAB && styles.tabButtonTextActive]}
              variant='text'
              title={tabName[TAB]}
              size='medium'
              color={tab === TAB ? 'primary' : 'tertiary'}
              onPress={TAB === TABS.REQUEST ? handleClickRequest : () => setTab(TAB)}
              accessibilityLabel={tabName[TAB]}
            />
          </View>
        ))}
      </View>
      {tab === 'PRODUCT' && (
        <>
      {!wishProducts.length ? (
        <Text style={styles.loading}>찜한 상품이 없습니다.</Text>
      ) : (
                <FlatList
          contentContainerStyle={styles.searchList}
          data={wishProducts}
          keyExtractor={(product) => `wishlist-wish-${product.id}`}
          renderItem={({ item: product, index: i }) => (
            <ProductCard product={product} type={'liked'} />
          )}
          ItemSeparatorComponent={() => <View style={styles.seperatorRow} accessible={false} />}
        />
      )}
        </>
      )}
      {tab === 'REQUEST' && (
      <>
          {!requests.filter(request => request.product).length ? (
        <Text style={styles.loading}>문의한 상품이 없습니다.</Text>
      ) : (
                <FlatList
          contentContainerStyle={styles.searchList}
          data={requests.filter(request => request.product)}
          keyExtractor={(request) => `wishlist-request-${request._id}`}
          renderItem={({ item: request, index: i }) => (
            <ProductCard product={request.product} type={'request'} />
          )}
          ItemSeparatorComponent={() => <View style={styles.seperatorRow} accessible={false} />}
        />
      )}
      </>
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
    height: 12,
    width: 1,
    backgroundColor: 'transparent',
  },
  empty: {
    width: 140,
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
    paddingTop: 13,
    alignItems: 'center',
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
    marginTop: 2,
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
    padding: 16,
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
});

