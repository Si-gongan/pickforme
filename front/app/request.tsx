import { TextInput, ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { numComma } from '../utils/common';
import { requestsAtom } from '../stores/request/atoms';
import { Product } from '../stores/request/types';
import Colors from '../constants/Colors';
import Button from '../components/Button';
import { Text, View } from '../components/Themed';
import Collapsible from 'react-native-collapsible';
import * as WebBrowser from 'expo-web-browser';

const tabName = {
  'RECOMMEND': '픽포미 추천',
  'RESEARCH': '픽포미 분석',
  'AI': 'AI 포미',
  'BUY': '',
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [isOpen, setIsOpen] = useState(true);
  const handleOpenUrl = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  }
  return (
    <Pressable onPress={() => setIsOpen(true)}>
      <View style={styles.product} key={`answer-product-${product.url}}`}>
        <Text style={styles.productTitle}>
          {product.title}
        </Text>
        <Text style={styles.productPrice}>
          {numComma(product.price)}
        </Text>
        <View style={styles.productTagWrap}>
          {product.tags.map((tag) => (
            <Button
              color='secondary'
              size='small'
              style={styles.productTag}
              key={`answer-product-${product.url}-${tag}}`}
              textStyle={styles.productTagText}
              title={tag}
            />
          ))}
        </View>
        <Collapsible collapsed={!isOpen}>
          <Text style={styles.productDesc}>
            {product.desc}
          </Text>
          <View style={styles.buttonWrap}>
            <Button
              size='small'
              title='접기'
              color='secondary'
              onPress={()=> setIsOpen(false)}
              style={styles.button}
            />
            <Button
              size='small'
              title='구매링크 이동'
              onPress={()=> handleOpenUrl(product.url)}
              style={styles.button}
            />
          </View>
        </Collapsible>
      </View>
    </Pressable>
  );
}

export default function RequestScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams();
  const request = useAtomValue(requestsAtom).find(({ _id }) => _id === `${requestId}`);
  if (!request) {
    return <Text>잘못된 접근입니다</Text>
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>
          {tabName[request.type]}
        </Text>
        <Text style={styles.subtitle}>
          의뢰 내용
        </Text>
        <Text style={styles.desc}>
          {request.text}
        </Text>
        <Text style={styles.subtitle}>
          추천 결과
        </Text>
        {request.answer.text ? (
          <>
            <Text style={styles.desc}>
              {request.answer.text}
            </Text>
            <View style={styles.productWrap}>
              {request.answer.products.map((product) => (
                <ProductCard key={`answer-product-${product.url}}`} product={product} />
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.desc}>
            매니저가 답변을 작성중입니다. 조금만 기다려주세요.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 30,
  },
  subtitle: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
    marginBottom: 18,
  },
  desc: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    marginBottom: 26,
  },
  productWrap: {
    marginTop: 9,
    flexDirection: 'column',
  },
  product: {
    backgroundColor: Colors.light.card.primary,
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
});
