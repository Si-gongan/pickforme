import React from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { Image, TextInput, Pressable, FlatList, ScrollView, View as ViewBase, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

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

export default function DiscoverScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const wishProducts = useAtomValue(wishProductsAtom);
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
  return (
    <View style={styles.container}>
      <View style={styles.horizontalPadder}>
        <View style={styles.header}>
        <DiscoverIcon style={styles.icon} />
        <Text style={styles.title} accessibilityRole='header' ref={headerTitleRef}>위시리스트</Text>
        </View>
      </View>
      {!wishProducts.length ? (
        <Text style={styles.loading}>위시리스트가 비어있습니다.</Text>
      ) : (
                <FlatList
          contentContainerStyle={styles.searchList}
          data={wishProducts}
          keyExtractor={(product) => `wishlist-${product.id}`}
          renderItem={({ item: product, index: i }) => (
            <>
            <ProductCard product={product} />
            {(i === wishProducts.length - 1) && (wishProducts.length % 2 === 1) && <View style={styles.empty} /> }
            </>
          )}
          ItemSeparatorComponent={() => <View style={styles.seperatorRow} accessible={false} />}
        />
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
    marginLeft: 7,
    marginRight: 7,
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
});

