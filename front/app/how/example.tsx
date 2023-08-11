import { ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { numComma } from '../../utils/common';
import { requestsAtom, previewAtom, getPreviewAtom } from '../../stores/request/atoms';
import { Product, Request, RequestStatus } from '../../stores/request/types';
import Colors from '../../constants/Colors';
import Button from '../../components/Button';
import { Text, View } from '../../components/Themed';
import useColorScheme, { ColorScheme } from '../../hooks/useColorScheme';
import Collapsible from 'react-native-collapsible';
import * as WebBrowser from 'expo-web-browser';

const tabName = {
  'recommend1': '[픽포미 추천 예시]',
  'research1': '[픽포미 분석 예시 - 일반]',
  'research2': '[픽포미 분석 예시 - 중고]',
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [isOpen, setIsOpen] = useState(true);
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const handleOpenUrl = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  }
  return (
    <Pressable
      onPress={() => setIsOpen(true)}
      accessible={!isOpen}
      accessibilityLabel={`${product.title} 상품정보를 상세히 보려면 터치하세요.`}
    >
      <View style={styles.product} key={`answer-product-${product.url}}`}>
        <Text style={styles.productTitle} accessibilityLabel={product.title}>
          {product.title}
        </Text>
        <Text style={styles.productPrice}>
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
              title={tag}
            />
          ))}
        </View>
        )}
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

const requestExamples: Request[] = [{
  type: 'RESEARCH',
  link: 'https://naver.com',
  _id: 'research1',
  name: '하드케이스',
  status: RequestStatus.SUCCESS,
  createdAt: '2023-08-11T14:15:56.933Z',
  chats: [],
  text: '살지 말지 고민하고 있는 휴대폰 케이스인데 디자인이 어떤지 궁금해요. 옵션별로 설명해주세요.',
  unreadCount: 0,
  answer: {
    text: '안녕하세요, 쿠팡에서 판매하고 있는 하드케이스 궁그미케이스 제품에 대해서 자세하게 설명해 드릴게요.',
    products: [{
      title: '[하드케이스 궁그미케이스] 아이폰13 갤럭시s22 a52s케이스 a32 a53 se3',
      desc: `이 휴대폰 케이스는 무광의 얇은 하드케이스에요. 폴리카보네이트 재질로, 광택이 없는 매트한 재질이에요. 얇아서 그립감이 좋고, 색바램이 적으며 생활기스에 강하다고 설명되어 있습니다.
이 케이스는 두 가지 옵션인 A와 B로 구성되어 있어요. 사이트에는 색상 옵션이라고 나와있는데, 실제로 두 케이스의 색상은 아이보리 색으로 동일하고, 뒷면에 그려져 있는 캐릭터에 차이가 있습니다. 캐릭터는 휴대폰 케이스의 아래쪽에 그려져 있으며, 케이스 전체의 3분의 2 정도를 차지하고 있습니다. 옵션 A에서는 얼굴이 큰 곰돌이가 오른쪽을 본 채로 왼쪽 손으로 턱을 괴고 있고, 오른쪽 손으로는 왼쪽 팔꿈치를 받치고 있습니다. 볼이 빵빵한 편이라 손에 볼살이 눌려있는 귀여운 모습을 하고 있어요. 곰돌이의 오른쪽 바로 위에는 흠…이라는 문구가 적혀있어요. 옵션 B에서는 얼굴이 큰 토끼가 왼쪽을 본 채로 오른쪽 손으로 턱을 괴고 있고, 손으로는 오른쪽 팔꿈치를 받치고 있습니다. 곰돌이와 반대 방향의 자세를 취하고 있어요. 마찬가지로 볼이 빵빵한 편이라 손에 볼살이 눌려있는 귀여운 모습을 하고 있어요. 토끼의 왼쪽 바로 위에 흠…이라는 문구가 적혀 있습니다.
해당 케이스는 7,900원에 판매되고 있고, 구매시 배송비 2,500원을 함께 지불해 총 10,400원에 판매되고 있습니다. 기종은 갤럭시 S시리즈부터 아이폰 13 프로 맥스까지 지원하고 있어요. 오늘 주문한다면 5월 10일에 도착 예정입니다. 구매 시 참고해주세요.`,
      url: 'http://naver.com',
      price: 7900,
      tags: ['쿠팡', '평점 4점, 리뷰 407개'],
    }],
  },
}, {
  type: 'RESEARCH',
  link: 'https://naver.com',
  _id: 'research2',
  name: '하드케이스',
  status: RequestStatus.SUCCESS,
  createdAt: '2023-08-11T14:15:56.933Z',
  chats: [],
  text: '휴대폰 케이스인데 디자인과 품질 상태가 궁금합니다. 원 상품의 가격도 궁금해요.',
  unreadCount: 0,
  answer: {
    text: '안녕하세요, 당근마켓의 44.9도의 매너온도를 가지신 딴딴이님이 올리신, 케이스티파이 아이폰 13 PRO 핸드폰 케이스에 대해 설명해드릴게요.',
    products: [{
      title: '[하드케이스 궁그미케이스] 아이폰13 갤럭시s22 a52s케이스 a32 a53 se3',
      desc: `이 휴대폰 케이스는 무광의 얇은 하드케이스에요. 폴리카보네이트 재질로, 광택이 없는 매트한 재질이에요. 얇아서 그립감이 좋고, 색바램이 적으며 생활
기스에 강하다고 설명되어 있습니다.
이 케이스는 두 가지 옵션인 A와 B로 구성되어 있어요. 사이트에는 색상 옵션이라고 나와있는데, 실제로 두 케이스의 색상은 아이보리 색으로 동일하고, 뒷면에 그려져 있는 캐릭터에 차이가 있습니다. 캐릭터는 휴대폰 케이스의 아래쪽에 그려져 있으며, 케이스 전체의 3분의 2 정도를 차지하고 있습니다. 옵션 A에서는 얼굴이 큰 곰돌이가 오른쪽을 본 채로 왼쪽 손으로 턱을 괴고 있고, 오른쪽 손으로는 왼쪽 팔꿈치를 받치고 있습니다. 볼이 빵빵한 편이라 손에 볼살이 눌려있는 귀여운 모습을 하고
있어요. 곰돌이의 오른쪽 바로 위에는 흠…이라는 문구가 적혀있어요. 옵션 B에서는 얼굴이 큰 토끼가 왼쪽을 본 채로 오른쪽 손으로 턱을 괴고 있고, 손으로는 오른쪽
팔꿈치를 받치고 있습니다. 곰돌이와 반대 방향의 자세를 취하고 있어요. 마찬가지로 볼이 빵빵한 편이라 손에 볼살이 눌려있는 귀여운 모습을 하고 있어요. 토끼의 왼쪽 바로 위에 흠…이라는 문구가 적혀 있습니다.
해당 케이스는 7,900원에 판매되고 있고, 구매시 배송비 2,500원을 함께 지불해 총 10,400원에 판매되고 있습니다. 기종은 갤럭시 S시리즈부터 아이폰 13 프로 맥스까>지 지원하고 있어요. 오늘 주문한다면 5월 10일에 도착 예정입니다. 구매 시 참고해주세요.`,
      url: 'http://naver.com',
      price: 7900,
      tags: ['쿠팡', '평점 4점, 리뷰 407개'],
    }],
  },
}, {
  type: 'RECOMMEND',
  _id: 'recommend1',
  name: '하드케이스',
  status: RequestStatus.SUCCESS,
  createdAt: '2023-08-11T14:15:56.933Z',
  price: '8만원대',
  chats: [],
  text: '들고 다닐 수 있는 녹음기를 추천해주세요. 5시간 이상 녹음이 가능했으면 좋겠어요',
  unreadCount: 0,
  answer: {
    text: '안녕하세요, 말씀해주신 ‘8만원 이하’ ‘휴대성’ ‘5시간 녹음 가능’ 조건을 반영한 녹음기를 쇼핑몰 플랫폼에서 리뷰와 평점, 가격이 좋은 세 상품을 시공간 해설진이 소개해드릴게요.',
    products: [{
      title: '[하드케이스 궁그미케이스] 아이폰13 갤럭시s22 a52s케이스 a32 a53 se3',
      desc: `이 휴대폰 케이스는 무광의 얇은 하드케이스에요. 폴리카보네이트 재질로, 광택이 없는 매트한 재질이에요. 얇아서 그립감이 좋고, 색바램이 적으며 생활
기스에 강하다고 설명되어 있습니다.
이 케이스는 두 가지 옵션인 A와 B로 구성되어 있어요. 사이트에는 색상 옵션이라고 나와있는데, 실제로 두 케이스의 색상은 아이보리 색으로 동일하고, 뒷면에 그려져 있는 캐릭터에 차이가 있습니다. 캐릭터는 휴대폰 케이스의 아래쪽에 그려져 있으며, 케이스 전체의 3분의 2 정도를 차지하고 있습니다. 옵션 A에서는 얼굴이 큰 곰돌이가 오른쪽을 본 채로 왼쪽 손으로 턱을 괴고 있고, 오른쪽 손으로는 왼쪽 팔꿈치를 받치고 있습니다. 볼이 빵빵한 편이라 손에 볼살이 눌려있는 귀여운 모습을 하고
있어요. 곰돌이의 오른쪽 바로 위에는 흠…이라는 문구가 적혀있어요. 옵션 B에서는 얼굴이 큰 토끼가 왼쪽을 본 채로 오른쪽 손으로 턱을 괴고 있고, 손으로는 오른쪽
팔꿈치를 받치고 있습니다. 곰돌이와 반대 방향의 자세를 취하고 있어요. 마찬가지로 볼이 빵빵한 편이라 손에 볼살이 눌려있는 귀여운 모습을 하고 있어요. 토끼의 왼쪽 바로 위에 흠…이라는 문구가 적혀 있습니다.
해당 케이스는 7,900원에 판매되고 있고, 구매시 배송비 2,500원을 함께 지불해 총 10,400원에 판매되고 있습니다. 기종은 갤럭시 S시리즈부터 아이폰 13 프로 맥스까>지 지원하고 있어요. 오늘 주문한다면 5월 10일에 도착 예정입니다. 구매 시 참고해주세요.`,
      url: 'http://naver.com',
      price: 7900,
      tags: ['쿠팡', '평점 4점, 리뷰 407개'],
    }],
  },
}];
export default function RequestExampleScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams();
  const request = requestExamples.find((example => example._id === requestId));

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
          {tabName[requestId as keyof typeof tabName]}
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
