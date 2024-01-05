import { StyleSheet, Pressable, Image } from 'react-native';
import { Text, View } from './Themed';

import { Product } from '../stores/discover/types';
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
import * as WebBrowser from 'expo-web-browser';
import { Link } from 'expo-router';

import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { numComma } from '../utils/common';
import Colors from '../constants/Colors';
import Button from '../components/Button';

interface Props {
  product: Product;
  isSimple?: boolean;
  requestId?: string;
}
const ProductCard: React.FC<Props> = ({ product, isSimple, requestId }) => {
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const handleOpenUrl = async (productUrl: string) => {
    await WebBrowser.openBrowserAsync(productUrl);
  }
  return (
    <View
      style={styles.product} key={`answer-product-${product.productUrl}}`}
    >
      <Image style={styles.productImage} source={{ uri: product.productImage }} />
      <View style={styles.footer}>
        <View style={styles.footerText}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.productName}
        </Text>
        <Text style={styles.productPrice} accessible>
          {numComma(product.productPrice)}원
        </Text>
        </View>
        <View style={styles.buttonWrap}>
          <Button
            size='small'
            title='구매링크 이동'
            onPress={()=> handleOpenUrl(product.productUrl)}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  product: {
    width: 140,
    height: '100%',
  },
  productImage: {
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  productTitle: {
    fontSize: 9,
    lineHeight: 11,
  },
  productPrice: {
    fontSize: 10,
    fontWeight: '600',
  },
  productDesc: {
    marginTop: 10,
    marginBottom: 12,
  },
  buttonWrap: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    gap: 10,
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 12,
  },
  footerText: {
    height: 40,
    backgroundColor: 'transparent',
  },
  footer: {
    backgroundColor: Colors[colorScheme].card.secondary,
    flexDirection: 'column',
    gap: 4,
    paddingTop: 6,
    paddingBottom: 10,
    paddingHorizontal: 7,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
});
export default ProductCard;
