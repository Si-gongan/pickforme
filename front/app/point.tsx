import { ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { userDataAtom } from '../stores/auth/atoms';
import Colors from '../constants/Colors';

import { numComma} from '../utils/common';
import Button, { ButtonText } from '../components/Button';
import { Text, View } from '../components/Themed';

interface Product {
  _id: string,
  name: string,
  point: number,
  price: number,
}

const TERM = `
유의사항

픽은 결제일로부터 30일 동안 이용하실 수 있습니다.

결제금액에는 부가세가 포함되어 있습니다.

멤버십은 매달 만료일에 다음달 이용료가 자동 결제됩니다.
`;
export default function PointScreen() {
  const router = useRouter();
  const userData = useAtomValue(userDataAtom);
  const subscriptionProducts: Product[] = [{
    _id: '1',
    name: '베이직',
    point: 10,
    price: 4900,
  }, {
    _id: '2',
    name: '스탠다드',
    point: 20,
    price: 9500,
  }, {
    _id: '3',
    name: '프리미엄',
    point: 30,
    price: 14000,
  }];
  const purchaseProducts: Product[] = [{
    _id: '4',
    name: '1픽 (1회 의뢰가능)',
    point: 1,
    price: 550,
  }, {
    _id: '5',
    name: '5픽 (5회 의뢰가능)',
    point: 5,
    price: 2750,
  }];
  const [selectedItem, setSelectedItem] = useState(subscriptionProducts[0]._id);
  const handleClick = (_id: string) => {
    setSelectedItem(_id);
  };
  const handleSubmit = () => {};
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.myPoint}>
            <Text style={styles.myPointText}>
              내 픽
            </Text>
            <Text style={styles.myPointNumber}>
              {userData?.point}P
            </Text>
          </View>
          <View style={styles.seperator} />
          <Text style={[styles.myPointText, styles.titleMargin]}>
            픽포미 멤버십
          </Text>
          <Text style={styles.subtitle}>
            매월 편하게 자동 충전할게요!
          </Text>
          {subscriptionProducts.map(product => {
            const color: 'primary' | 'tertiary' = selectedItem === product._id ? 'primary' : 'tertiary';
            const buttonTextProps = { color };
            return (
              <Button
                key={`Point-Product-${product._id}`}
                size='medium'
                style={styles.card}
                color={color}
                onPress={() => handleClick(product._id)}
              > 
                <ButtonText {...buttonTextProps} textStyle={[styles.productName, styles.productNameMargin]}>
                  {product.name}
                </ButtonText>
                <View style={styles.row}>
                  <ButtonText {...buttonTextProps} textStyle={styles.productPoint}>
                    {product.point}픽
                  </ButtonText>
                  <ButtonText {...buttonTextProps} textStyle={styles.productPrice}>
                    월 {numComma(product.price)}원 
                  </ButtonText>
                </View>
              </Button>
            );
          })}
          <Text style={[styles.myPointText, styles.titleMargin]}>
            픽포미 1회권
          </Text>
          <Text style={[styles.subtitle]}>
            필요할 때마다 구매할게요!
          </Text>
          {purchaseProducts.map(product => {
            const color: 'primary' | 'tertiary' = selectedItem === product._id ? 'primary' : 'tertiary';
            const buttonTextProps = { color };
            return (
              <Button
                key={`Point-Product-${product._id}`}
                size='medium'
                style={styles.card}
                color={color}
                onPress={() => handleClick(product._id)}
              > 
                <View style={[styles.row, styles.rowMargin]}>
                  <ButtonText {...buttonTextProps} textStyle={styles.productName}>
                    {product.name}
                  </ButtonText>
                  <ButtonText {...buttonTextProps} textStyle={styles.productPrice}>
                    {numComma(product.price)}원 
                  </ButtonText>
                </View>
              </Button>
            );
          })}
          <Text style={styles.terms}>
            {TERM}
          </Text>
        </View>
      </ScrollView>
      <View style={styles.buttonWrap}>
        <Button title='확인' onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 31,
  },
  seperator: {
    height: 1,
    width: '100%',
    marginTop: 20,
    marginBottom: 3,
    backgroundColor: Colors.light.borderColor.primary,
  },
  titleMargin: {
    marginTop: 24,
  },
  subtitle: {
    marginTop: 9,
    marginBottom: 15,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 17,
  },
  myPoint: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myPointText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
  },
  myPointNumber: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 27,
  },
  row: {
    alignSelf: 'center',
    justifySelf: 'center',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  card: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 17,
    borderRadius: 10,
    marginBottom: 12,
  },
  rowMargin: {
    marginTop: 13,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  productNameMargin: {
    marginTop: 13,
    marginBottom: 9,
  },
  productPoint: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
  },
  productPrice: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 22,
  },
  terms: {
    marginTop: 12,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 15,
  },
  buttonWrap: {
    width: '100%',
    padding: 31,
  },
});
