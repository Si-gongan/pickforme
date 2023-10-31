import { useEffect } from 'react';
import { ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { userDataAtom } from '../stores/auth/atoms';
import { buyAtom, toggleBuyAtom, getBuyAtom } from '../stores/request/atoms';

import * as WebBrowser from 'expo-web-browser';
import Button from '../components/Button';
import { Text, View } from '../components/Themed';
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
import TBDImage from '../assets/images/buy/TBD.svg';
import Colors from '../constants/Colors';

import HeartIcon from '../assets/images/buy/heart.svg';
import HeartOutlinedIcon from '../assets/images/buy/heart_outlined.svg';

export default function BuyScreen() {
  const router = useRouter();
  const userData = useAtomValue(userDataAtom);
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const buy = useAtomValue(buyAtom);
  const getBuy = useSetAtom(getBuyAtom);
  const toggleBuy = useSetAtom(toggleBuyAtom);

  useEffect(() => {
    getBuy();
  }, [getBuy]);
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, styles.container]}>
        <TBDImage style={styles.img} />
        <Text style={styles.title}>
          서비스를 준비 중입니다.
        </Text>
        <Text style={[styles.desc, styles.marginBottomS]}>
          결제 과정의 접근성이 낮아 상품 구매에 어려움을 겪으셨던 적이 있으신가요?
          </Text>
        <Text style={[styles.desc, styles.marginBottomL]}>
이제 픽포미 매니저가 대신 안전하고 빠르게 구매해드릴게요. 상품 구매, 티켓 예매, 중고물품 거래까지 모두 맡겨보세요!
        </Text>
        <Text style={[styles.desc, styles.marginBottomS]}>
          픽포미 구매 서비스가 필요하시다면 아래 ‘서비스가 필요해요’ 버튼을 눌러주세요. 
        </Text>
        <Button
          style={[styles.button, styles.buyButton, styles.marginBottomS]}
          onPress={toggleBuy}
          renderChildrenPosition = 'back'
          title='서비스가 필요해요'
          size='medium'
        >
          {buy ? (
            <HeartIcon style={styles.heartIcon} />
          ) : (
            <HeartOutlinedIcon style={styles.heartIcon} />
          )}
        </Button>
        <Text style={[styles.desc, styles.marginBottomM]}>
          픽포미 구매 대행 서비스에 의견이 있으신가요?
        </Text>
        <Button
          onPress={() => WebBrowser.openBrowserAsync('http://pf.kakao.com/_csbDxj')}
          style={styles.button}
          title='문의하기'
          size='medium'
        />
      </ScrollView>
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 27,
    paddingVertical: 50,
  },
  img: {
    color: Colors[colorScheme].text.primary,
    width: 70,
    height: 70,
    marginBottom: 19,
  },
  title: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 52,
  },
  desc: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
  },
  marginBottomS: {
    marginBottom: 33,
  },
  marginBottomM: {
    marginBottom: 50,
  },
  marginBottomL: {
    marginBottom: 75
  },
  button: {
    paddingHorizontal: 28,
  },
  buyButton: {
    display: 'flex',
    flexDirection: 'row',
  },
  heartIcon: {
    marginLeft: 2,
    color: Colors[colorScheme].buttonText.primary,
  },
});
