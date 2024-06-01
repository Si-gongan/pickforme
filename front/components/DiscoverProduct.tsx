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
    if (product.id) {
      router.push(`/discover-detail-main?productId=${product.id}`);
    } else {
      router.push(`/discover-detail-main?productUrl=${encodeURIComponent(product.url)}`);
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
            <View style={styles.wrap}>
          <Text style={styles.name} accessible>
            {product.name}
          </Text>
          <Text style={styles.price} accessible>
            {numComma(product.price)}원
          </Text>
            </View>
    </Pressable>
  );
});

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  pressable: {
    width: '100%',
  },
  wrap: {
    borderRadius: 4,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 20,
    width: '100%',
    backgroundColor: '#F1F1F1',
  },
  name: {
    fontSize: 12,
    color: '#1E1E1E',
    fontWeight: '500',
    lineHeight: 20,
    flex: 1,
  },
  price: {
    fontSize: 12,
    lineHeight: 14.52,
    color: '#1E1E1E',
    fontWeight: '700',
  },
});
export default ProductCard;
