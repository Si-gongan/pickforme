import { ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { userDataAtom } from '../stores/auth/atoms';
import Colors from '../constants/Colors';

import Button from '../components/Button';
import { Text, View } from '../components/Themed';

interface Product {
  _id: string,
  name: string,
  point: number,
  price: number,
}
export default function PointScreen() {
  const router = useRouter();
  const userData = useAtomValue(userDataAtom);
  const products: Product[] = [{
    _id: '1',
    name: '베이직 (10회 이용 가능) ',
    point: 5000,
    price: 4900,
  }, {
    _id: '2',
    name: '스탠다드 (20회 이용 가능) ',
    point: 10000,
    price: 9500,
  }, {
    _id: '3',
    name: '프리미엄 (40회 이용 가능) ',
    point: 20000,
    price: 18000,
  }]
  const handleSubmit = () => {};
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.myPoint}>
          <Text style={styles.myPointText}>
            내 포인트
          </Text>
          <Text style={styles.myPointNumber}>
            {userData?.point}P
          </Text>
        </View>
        <View style={styles.seperator} />
        <Text style={[styles.myPointText, styles.titleMargin]}>
          충전 포인트 선택
        </Text>
        {products.map(product => (
          <View key={`Point-Product-${product._id}`} style={styles.card}>
            <Text style={styles.productName}>
              {product.name}
            </Text>
            <View style={styles.row}>
              <Text style={styles.productPoint}>
                {product.point}
              </Text>
              <Text style={styles.productPrice}>
                {product.price}원 
              </Text>
            </View>
          </View>
        ))}
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
    marginTop: 39,
    marginBottom: 50,
    backgroundColor: Colors.light.borderColor.primary,
  },
  titleMargin: {
    marginBottom: 30,
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
  productName: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '600',
    lineHeight: 17,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  card: {
    paddingVertical: 15,
    paddingHorizontal: 17,
    borderRadius: 10,
    backgroundColor: Colors.light.card.primary,
    marginBottom: 25,
  },
  productPoint: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  buttonWrap: {
    width: '100%',
    padding: 31,
  },
});
