import { useState } from 'react';
import { TextInput, ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import { addRequestAtom } from '../stores/request/atoms';
import { RecommendRequestParams } from '../stores/request/types';
import Colors from '../constants/Colors';

import Button from '../components/Button';
import { Text, View } from '../components/Themed';


export default function RecommendScreen() {
  const router = useRouter();
  const addRequest = useSetAtom(addRequestAtom);
  const [data, setData] = useState<RecommendRequestParams>({
    type: 'RECOMMEND',
    price: '',
    text: '',
  });
  const handleSubmit = () => {
    addRequest(data);
    router.push('(tabs)/requests')
  }
  return (
    <View style={styles.container}>
      <ScrollView
        scrollEnabled
      >
        <View style={[styles.container, styles.containerInner]}>
        <Text style={styles.title}>
          어떤 상품을 추천해드릴까요?
        </Text>
        <Text style={styles.label}>
          원하시는 상품에 대해 알려주세요.
        </Text>
        <View style={styles.textAreaContainer} >
          <TextInput
            style={[styles.textArea, styles.textAreaBig]}
            underlineColorAndroid="transparent"
            numberOfLines={6}
            multiline={true}
            onChangeText={(text) => setData({ ...data, text })}
          />
        </View>
        <Text style={styles.label}>
          원하시는 가격대를 적어주세요.
        </Text>
        <View style={styles.textAreaContainer} >
          <TextInput
            style={styles.textArea}
            underlineColorAndroid="transparent"
            onChangeText={(price) => setData({ ...data, price })}
          />
        </View>
        </View>
      </ScrollView>
      <View style={styles.buttonWrap}>
        <Button title='추천 의뢰하기 500P' onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderColor: Colors.light.borderColor.primary,
    borderWidth: 1,
    padding: 5,
    marginBottom: 29,
  },
  textArea: {
  },
  textAreaBig: {
    height: 132,
  },
  buttonWrap: {
    padding: 20,
  }
});
