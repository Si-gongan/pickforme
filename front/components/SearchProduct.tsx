import { StyleSheet, Pressable, Image } from 'react-native';
import { Text, View } from './Themed';

import { ChatProduct as Product } from '../stores/request/types';
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';

import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { numComma } from '../utils/common';
import Colors from '../constants/Colors';
import Button from '../components/Button';

interface Props {
  product: Product;
}
const ProductCard: React.FC<Props> = ({ product }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const handleOpenUrl = async () => {
    router.push(`/discover-detail?productId=${product.id}`);
  }
  return (
    <View
      style={styles.product}
    >
      <Image style={styles.productImage} source={{ uri: product.thumbnail }} />
      <View style={styles.footer}>
        <View style={styles.footerText}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productPrice} accessible>
          {numComma(product.price)}원
        </Text>
        </View>
        <View style={styles.buttonWrap}>
          <Button
            size='small'
            title='자세히보기'
            onPress={handleOpenUrl}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  product: {
    width: '50%',
    height: '100%',
  },
  productImage: {
    height: 132,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productTitle: {
    fontSize: 10,
    lineHeight: 11,
  },
  productPrice: {
    fontSize: 11,
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
