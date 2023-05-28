import { TextInput, ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { userDataAtom } from '../stores/auth/atoms';

import Button from '../components/Button';
import { Text, View } from '../components/Themed';


export default function TabOneScreen() {
  const router = useRouter();
  const userData = useAtomValue(userDataAtom);
  return (
    <View style={styles.container}>
      <ScrollView
        scrollEnabled
      >
        <View style={[styles.container, styles.containerInner]}>
        <Text style={styles.title}>
          어떤 상품을 분석해드릴까요?
        </Text>
        <Text style={styles.label}>
          의뢰할 상품의 링크를 입력해주세요.
        </Text>
        <Text style={styles.label}>
          매니저가 참고해야 하는 점이 있으면 알려주세요.
        </Text>
        <View style={styles.textAreaContainer} >
          <TextInput
            style={[styles.textArea, styles.textAreaBig]}
            underlineColorAndroid="transparent"
            numberOfLines={3}
            multiline={true}
          />
        </View>
        </View>
      </ScrollView>
      <View style={styles.buttonWrap}>
        <Button title='추천 의뢰하기 500P' />
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
    flexDirection: 'row',
    borderColor: '#9FA7C3',
    borderWidth: 1,
    padding: 5,
    marginBottom: 29,
  },
  textArea: {
    alignSelf: "stretch",
  },
  textAreaBig: {
    height: 73,
  },
  buttonWrap: {
    padding: 20,
  }
});
