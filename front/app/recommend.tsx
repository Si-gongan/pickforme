import { useState } from 'react';
import { TextInput, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSetAtom } from 'jotai';
import { addRequestAtom } from '../stores/request/atoms';
import { RecommendRequestParams } from '../stores/request/types';
import Colors from '../constants/Colors';
import useCheckPoint from '../hooks/useCheckPoint';
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';

import Button from '../components/Button';
import { Text, View } from '../components/Themed';


export default function RecommendScreen() {
  const router = useRouter();
  const addRequest = useSetAtom(addRequestAtom);
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const [data, setData] = useState<RecommendRequestParams>({
    type: 'RECOMMEND',
    price: '',
    text: '',
  });
  const disabled = !data.price;
  const handleSubmit = useCheckPoint(1, () => {
    addRequest(data);
    router.push('(tabs)/requests')
  });
  return (
    <View style={styles.container}>
      <ScrollView
        scrollEnabled
      >
        <View style={[styles.container, styles.containerInner]}>
          <Text style={styles.title}>
            어떤 상품을 추천해드릴까요?
          </Text>
          <Link
            href={`/recommend-sample`}
            asChild
          >
            <Button style={styles.button} textStyle={styles.buttonText} title='작성 예시' size='medium' />
          </Link>
          <Text style={styles.label}>
            원하시는 상품과 가격대를 적어주세요.
          </Text>
          <View style={styles.textAreaContainer} >
            <TextInput
              style={styles.textArea}
              underlineColorAndroid="transparent"
              onChangeText={(price) => setData({ ...data, price })}
            />
          </View>
          <Text style={styles.label}>
            (선택) 상품 선택 시 고려하는 조건과, 상품과 연관된 고객님의 특징(성별, 사이즈, 색상, 스타일 등)을 작성해 주세요.
          </Text>
          <View style={styles.textAreaContainer} >
            <TextInput
              style={[styles.textArea, styles.textAreaBig]}
              underlineColorAndroid="transparent"
              numberOfLines={6}
              textAlignVertical='top'
              multiline={true}
              onChangeText={(text) => setData({ ...data, text })}
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonWrap}>
        <Button title='1픽 사용하여 추천 의뢰하기' onPress={handleSubmit} disabled={disabled} />
      </View>
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  containerInner: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: 29,
  },
  label: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    marginBottom: 19,
  },
  textAreaContainer: {
    width: '100%',
    borderColor: Colors[colorScheme].borderColor.primary,
    borderWidth: 1,
    padding: 5,
    marginBottom: 29,
  },
  textArea: {
    color: Colors[colorScheme].text.primary,
  },
  textAreaBig: {
    height: 132,
  },
  buttonText: {
    color: Colors[colorScheme].text.primary,
  },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors[colorScheme].text.primary,
    marginBottom: 37,
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
  },
  buttonWrap: {
    padding: 20,
  }
});
