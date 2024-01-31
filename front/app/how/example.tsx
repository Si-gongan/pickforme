import { ScrollView, StyleSheet, Pressable, Image } from 'react-native';
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
  'recommend1': '[상품 추천 예시]',
  'research1': '[상품 설명 예시 - 일반 상품]',
  'research2': '[상품 설명 예시 - 중고 상품]',
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
          {numComma(product.price)}원
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
              title='구매링크로 이동하기'
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
  link: 'https://www.coupang.com/vp/products/6577557254',
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
      desc: `상세페이지 요약: 이 휴대폰 케이스는 얇아서 그립감이 좋고, 색바램이 적으며 생활기스에 강합니다. 광택이 없고 매트한 재질이에요. 
배경은 모두 아이보리 색이며 뒷 면에 그려진 캐릭터 두 개 중 하나를 선택할 수 있습니다. 캐릭터는 케이스의 아래쪽에 검은 선으로 그려져 있으며, 전체의 3분의 2 정도를 차지합니다.
제품 이미지 묘사: 옵션 A에서는 얼굴이 큰 곰돌이가 오른쪽을 본 채로 왼쪽 손으로 턱을 괴고 있고, 오른쪽 손으로는 왼쪽 팔꿈치를 받치고 있습니다. 빵빵한 볼살이 손에 눌린 귀여운 모습을 하고 있어요. 곰돌이 위에는 Hmm…이라는 문구가 있습니다.
옵션 B에서는 얼굴이 큰 토끼가 왼쪽을 보며 오른쪽 손으로 턱을 괴고, 팔꿈치를 받치고 있습니다. 마찬가지로 빵빵한 볼살이 손에 눌린 귀여운 모습을 하고 있어요. 토끼 위에는 Hmm…이라는 문구가 있습니다.
배송 정보: 배송비 2,500원, 오늘 주문 시 6일 뒤 도착 예정 
리뷰 1: 너무 귀엽고 좋네요!
리뷰 2: 핸드폰 깨질 위험성이 높아요.
리뷰 3: S22 플러스 모델을 주문했는데 S22 모델을 보내왔네요. 주의해주세요.
      `,
      url: 'https://www.coupang.com/vp/products/6577557254',
      price: 7900,
      tags: ['쿠팡', '리뷰 38개', '평점 4.5점'],
    }],
  },
}, {
  type: 'RESEARCH',
  link: 'https://www.daangn.com/articles/694548548',
  _id: 'research2',
  name: '하드케이스',
  status: RequestStatus.SUCCESS,
  createdAt: '2023-08-11T14:15:56.933Z',
  chats: [],
  text: '양귀자 모순 책인데 디자인이랑 상태가 궁금합니다. 정가도 궁금해요.',
  unreadCount: 0,
  answer: {
    text: '안녕하세요, 고객님께서 의뢰하신 도서 양귀자의 모순에 대해 설명해 드릴게요. 사진으로 확인 가능한 제품의 상태나 하자, 원 상품의 가격을 알려드립니다. 다만, 사진만으로 제품의 상태를 확실하게 확인하기 어려울 수 있다는 점 참고 부탁드립니다.',
    products: [{
      title: '도서 양귀자의 모순, 판매자 당근마켓 쿠리스 님 (매너온도 36.5도)',
      desc: `판매자가 올린 글 요약: 2회독한 책이에요. 필기는 없고 내부 상태는 좋다고 해요. 봉천역 직거래 희망한다고 합니다. 세 장의 제품 사진을 올려주셨어요.
      판매자가 올린 사진 설명: 천 같은 재질의 연두색 하드커버예요. 책을 꽂을 때 보이는 측면으로는 아이보리 색이 두꺼운 띄처럼 감싸고 있어요. 앞표지에는 제목과 디자인이 파란색으로 각인되어 있어요. 줄에 새 두마리가 등을 돌리고 앉아 있는 디자인이에요. 뒷표지는 책에서 발췌한 글이 파랑색으로 각인되어 있어요. 전반적으로 차분하고 절제된 느낌을 주는 디자인이에요. 
      판매자 분이 올려준 사진으로 보았을 때 제품의 상태는 약간의 사용감이 있어 보여요. 앞표지는 전반적으로 깨끗하고 상태는 좋은 편이에요. 다만 뒤표지에 손가락 두마디 정도의 영역에 옅은 얼룩들이 보여요. 천처럼 쉽게 흡수되는 재질이라 얼룩은 연두색이 약간 짙어진 정도예요. 측면은 재질 특성상 귀퉁이가 약간 접혀있지만 큰 하자는 없어보여요.
      새 제품 정보: 해당 제품은 쿠팡에서 정가 사이트에서 정가 11,700원에 판매되는 상품이에요. 표지는 쇄마다 바뀐다고 해서 현재 연두색 표지의 상품은 정식 구매가 어려워요. 현재 쿠팡에서 판매되고 있는 상품은 아이보리 배경에 보라색으로 각인된 디자인이에요. 쿠팡에서 판매되고 있는 상품은 다음 링크에서 확인할 수 있습니다.`,
      url: 'https://www.daangn.com/articles/694548548',
      price: 5000,
      tags: [],
    }],
  },
}, {
  type: 'RECOMMEND',
  _id: 'recommend1',
  name: '휴대용 녹음기',
  status: RequestStatus.SUCCESS,
  createdAt: '2023-08-11T14:15:56.933Z',
  price: '8만원대',
  chats: [],
  text: '8만원 이하의 들고 다닐 수 있는 녹음기를 추천해주세요. 5시간 이상 녹음이 가능했으면 좋겠어요',
  unreadCount: 0,
  answer: {
    text: '안녕하세요, 말씀해주신 ‘8만원 이하’ ‘휴대성’ ‘5시간 녹음 가능’ 조건을 반영한 녹음기를 쇼핑몰 플랫폼에서 리뷰와 평점이 좋은 세 상품을 소개해드릴게요.',
    products: [{
      title: '디큐브 볼펜 녹음기',
      desc: `매니저의 한줄 추천 이유: 타 상품 대비 가볍고 휴대성이 좋습니다.
구체적인 제품 소개: 디큐브의 휴대용 소형 볼펜녹음기 VR-7000는 검정색 볼펜 형태이며 휴대성이 좋습니다. 원거리 녹음이 가능하며 음성이 인식될 때만 자동으로 녹음하는 기능도 있습니다. 또한 타 기기와의 호환성이 뛰어나 연결하여 녹음 내용을 듣기 용이합니다.
      `, 
      url: 'https://www.coupang.com/vp/products/6299434247',
      price: 47900,
      tags: ['쿠팡', '리뷰 520개', '평점 4점'],
    },
    {
      title: '버즈 미니 초소형 녹음기 16GB',
      desc: `매니저의 한줄 추천 이유: 타 상품 대비 사이즈가 작고 가벼우며, 깔끔하게 녹음됩니다. 
구체적인 제품 소개: 버즈 미니 초소형 녹음기 BUZZ-V5는 하얀색의 긴 네모 형태로, 굉장히 작고 얇아 막대사탕보다 가볍습니다. 녹음기에는 슬라이드형 녹음 버튼과 마이크, 상태표시등이 있습니다. 동봉된 케이블로 타 기기와 연결하여 녹음을 들을 수 있습니다. 
      `, 
      url: 'https://www.coupang.com/vp/products/6259927520',
      price: 56640,
      tags: ['쿠팡', '리뷰 367개', '평점 4.5점'],
    },
    {
      title: '소니 보이스 레코더',
      desc: `매니저의 한줄 추천 이유: 재생 중 배속 조절이 가능하고, 버튼을 조작할 때 소리를 켜고 끌 수 있습니다. 
구체적인 제품 소개: 소니 보이스 레코더 ICD-PX240는 녹음과 재생이라는 기본 기능에 충실하여 큼직한 버튼이 직관적으로 구성되어 있습니다. 72g으로 들고 다니기에 적절하며, 충전식이 아닌 AAA 배터리 2개로 사용되는 배터리 형식의 녹음기입니다.
      `, 
      url: 'https://www.coupang.com/vp/products/24071011',
      price: 78000,
      tags: ['쿠팡', '리뷰 423개', '평점 4.5점'],
    },
  
  ],
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
          결과 리포트
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
