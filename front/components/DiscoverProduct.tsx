import { StyleSheet, View as ViewBase, Pressable, Image } from 'react-native';
import { Text, View } from './Themed';

import { Product } from '../stores/discover/types';
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
import { useRouter } from 'expo-router';

import { useAtomValue, useSetAtom } from 'jotai';
import { forwardRef, useState } from 'react';
import { numComma } from '../utils/common';
import Colors from '../constants/Colors';
import Button from '../components/Button';

interface Props {
  product: Product;
}
const ProductCard = forwardRef<ViewBase, Props>(({ product }, ref) => {
    const router = useRouter();

  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const handlePress = () => {
    console.log(product.platform);
    if (product.platform === 'coupang') {
      router.push(`/discover-detail-main?productId=${product.id}`);
    } else {
      router.push(`/discover-detail?productId=${product.id}`);
    }
  }
  return (
    <Pressable
      onPress={handlePress}
            accessible
      ref={ref}
            accessibilityRole='button'
            accessibilityLabel={`${product.name} ${numComma(product.price)}원`}
            style={styles.pressable}
            >
      <Image style={styles.thumbnail} source={{ uri: product.thumbnail }} />
      <View style={styles.footer}>
        <View style={styles.footerText}
        >
          <Text style={styles.productTitle} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.price} accessible>
            {numComma(product.price)}원
          </Text>
        </View>
        <View style={styles.buttonWrap}>
          <Button
            size='small'
            accessible={false}
            title='자세히보기'
            onPress={handlePress}
            style={styles.button}
          />
        </View>
      </View>
    </Pressable>
  );
});

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  pressable: {
    width: 140,
    height: '100%',
  },
  thumbnail: {
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  productTitle: {
    fontSize: 9,
    lineHeight: 11,
  },
  price: {
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
