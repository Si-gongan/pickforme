import { ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { numComma } from '../utils/common';
import { requestsAtom, previewAtom, getPreviewAtom } from '../stores/request/atoms';
import { Product } from '../stores/request/types';
import Colors from '../constants/Colors';
import Button from '../components/Button';
import { Text, View } from '../components/Themed';
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
import Collapsible from 'react-native-collapsible';
import * as WebBrowser from 'expo-web-browser';

const tabName = {
  'RECOMMEND': '픽포미 추천',
  'RESEARCH': '픽포미 분석',
  'AI': 'AI 포미',
  'BUY': '',
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const handleOpenUrl = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  }
  return (
    <View
      style={styles.product} key={`answer-product-${product.url}}`}
    >
      <Text style={styles.productTitle}>
        {product.title}
      </Text>
      <Text style={styles.productPrice} accessible>
        {numComma(product.price)}
      </Text>
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
      <Text style={styles.productDesc}>
        {product.desc}
      </Text>
      <View style={styles.buttonWrap}>
        <Button
          size='small'
          title='구매링크 이동'
          onPress={()=> handleOpenUrl(product.url)}
          style={styles.button}
        />
      </View>
    </View>
  );
}

export default function RequestScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams();
  const request = useAtomValue(requestsAtom).find(({ _id }) => _id === `${requestId}`);
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  if (!request) {
    return <Text>잘못된 접근입니다</Text>
  }
  const handleOpenUrl = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  }

  const getPreview = useSetAtom(getPreviewAtom);
  const preview = useAtomValue(previewAtom);

  return (
    <View style={styles.container}>
      <ScrollView>
      <View style={styles.inner}>
        <Text style={styles.title}>
          {tabName[request.type]}
        </Text>
        <Text style={styles.subtitle}>
          의뢰 내용
        </Text>
        <Text style={styles.desc}>
          {request.text}
        </Text>
        {request.type === 'RECOMMEND' && (
        <>
          <Text style={styles.subtitle}>
            가격대
          </Text>
          <Text style={styles.desc}>
            {request.price}
          </Text>
        </>
        )}

        {request.type === 'RESEARCH' && preview ? (
          <Pressable onPress={() => handleOpenUrl(request.link)}>
            <View style={styles.meta}>
              <Image style={styles.metaImg} source={{ uri: preview.image }} />
              <View style={styles.metaContent}>
              <Text style={styles.metaTitle}>
                {preview.title}
              </Text>
              <Text style={styles.metaDesc}>
                {preview.desc}
              </Text>
              </View>
            </View>
          </Pressable>
        ) : <View style={styles.empty} />}
        <Text style={styles.subtitle}>
          {request.type === 'RESEARCH' ? '분석 ' : '추천'} 결과
        </Text>
        {request.answer ? (
          <>
            {request.answer.text && (
            <Text style={styles.desc}>
              {request.answer.text}
            </Text>
            )}
            {!!request.answer.products?.length && (
            <View style={styles.productWrap}>
              {request.answer.products.map((product) => (
                <ProductCard key={`answer-product-${product.url}}`} product={product} />
              ))}
            </View>
            )}
          </>
        ) : (
          <Text style={styles.desc}>
            매니저가 답변을 작성중입니다. 조금만 기다려주세요.
          </Text>
        )}
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
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
    gap: 26,
  },
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
  meta: {
    marginBottom: 30,
    borderWidth: 1,
    borderColor: Colors[colorScheme].borderColor.primary,
    borderRadius: 15,
  },
  metaImg:{
    resizeMode: 'cover',
  },
  metaContent: {
    padding: 15,
    borderRadius: 15,
  },
  metaTitle: {
    fontWeight: '600',
    marginBottom: 6,
  },
  metaDesc: {
  },
  empty: {
    marginBottom: 30,
  },
});
