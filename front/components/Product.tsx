import { StyleSheet, Pressable, Image } from 'react-native';
import { Text, View } from './Themed';

import { Product } from '../stores/request/types';
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
  const handleOpenUrl = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  }
  return (
    <View
      style={styles.product} key={`answer-product-${product.url}}`}
    >
      <View style={[styles.header, isSimple && styles.simpleHeader]}>
        <Text style={styles.productTitle}>
          {product.title}
        </Text>
        <Text style={styles.productPrice} accessible>
          {numComma(product.price)}원
        </Text>
      </View>
      {!!product.tags.length && (
      <View style={styles.productTagWrap}>
        {product.tags.map((tag) => (
          <Button
            color='secondary'
            size='small'
            style={styles.productTag}
            key={`answer-product-${product.url}-${tag}}`}
            textStyle={styles.productTagText}
            readOnly
            title={tag}
          />
        ))}
      </View>
      )}
      {!isSimple && (
      <Text style={styles.productDesc}>
        {product.desc}
      </Text>
      )}
      <View style={styles.buttonWrap}>
        <Button
          size='small'
          title='구매링크로 이동하기'
          onPress={()=> handleOpenUrl(product.url)}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  product: {
    backgroundColor: Colors[colorScheme].card.primary,
    borderRadius: 13,
    paddingVertical: 16,
    paddingHorizontal: 13,
  },
  productTitle: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    marginBottom: 8,
  },
  productPrice: {
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 15,
    marginBottom: 8,
  },
  productTagWrap: {
    flexWrap: 'wrap',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    gap: 9,
  },
  productTag: {
    paddingHorizontal: 12,
  },
  productTagText: {
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
  header: {
    backgroundColor: 'transparent',
  },
  simpleHeader: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
});
export default ProductCard;
