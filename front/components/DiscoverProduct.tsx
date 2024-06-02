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
  type: 'normal' | 'liked' | 'request';
}
const ProductCard = forwardRef<ViewBase, Props>(({ product, type = 'normal' }, ref) => {
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
  if (type === 'liked') {
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
          <View style={styles.wrap6}>
            <Text numberOfLines={1} style={styles.name} accessible>{product.name}</Text>
            <Text style={styles.price} accessible>{numComma(product.price)}원</Text>
          </View>
          <View>
            {/* like 취소 버튼 */}
          </View>
        </View>
      </Pressable>
    );
  }
  if (type === 'request') {
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
          <Text numberOfLines={2} style={styles.name} accessible>
            {product.name}
          </Text>
          <Text style={styles.price} accessible>
            {numComma(product.price)}원
          </Text>
        </View>
      </Pressable>
    );
  }
  if (product.ratings === undefined){
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
          <Text numberOfLines={2} style={styles.name} accessible>
            {product.name}
          </Text>
          <Text style={styles.price} accessible>
            {numComma(product.price)}원
          </Text>
        </View>
      </Pressable>
    );
  } else {
    return (
      <Pressable
        onPress={handlePress}
        accessible
        ref={ref}
        accessibilityRole='button'
        accessibilityLabel={`${product.name} ${numComma(product.price)}원`}
        style={styles.pressable}
      >
        <View style={styles.wrap2}>
          <View style={styles.wrap3}>
            <Text style={styles.reviews} accessible>리뷰 {product.reviews}개</Text>
            <Text style={styles.ratings} accessible>평점 {Math.floor(product.ratings / 20 * 10) / 10}점</Text>
          </View>
          <View style={styles.wrap4}>
            <Text numberOfLines={1} style={styles.name} accessible>{product.name}</Text>
            <View style={styles.wrap5}>
              <Text style={styles.discount_rate} accessible>{(product.discount_rate ?? 0) !== 0  ? `${product.discount_rate}%` : ''}</Text>
              <Text style={styles.price} accessible>{numComma(product.price)}원</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }
  
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
  wrap2: {
    borderRadius: 4,
    padding: 15,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    backgroundColor: '#F1F1F1',
  },
  wrap3: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
    backgroundColor: '#F1F1F1',
  },
  wrap4: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F1F1F1',
  },
  wrap5: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#F1F1F1',
  },
  wrap6: {
    flex:1,
    flexDirection: 'column',
    backgroundColor: '#F1F1F1',
    gap: 6,
  },
  reviews: {
    fontSize: 12,
    color: '#1E1E1E',
    fontWeight: 'bold',
  },
  ratings: {
    fontSize: 12,
    color: '#1E1E1E',
    fontWeight: 'bold',
  },
  discount_rate: {
    fontSize: 12,
    color: '#4A5CA0',
    fontWeight: 'bold',
  }
});
export default ProductCard;
