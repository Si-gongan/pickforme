import { useState } from 'react';
import { TextInput, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSetAtom } from 'jotai';
import { addRequestAtom } from '../stores/request/atoms';
import { pushBottomSheetAtom } from '../stores/layout/atoms';
import { RecommendRequestParams } from '../stores/request/types';
import Colors from '../constants/Colors';
import useCheckPoint from '../hooks/useCheckPoint';
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
import CheckBox from '../components/CheckBox';


import Button from '../components/Button';
import { Text, View } from '../components/Themed';


export default function RecommendScreen() {
  const router = useRouter();
  const addRequest = useSetAtom(addRequestAtom);
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const [isShareChecked, setIsShareChecked] = useState(false);
  const pushBottomSheet = useSetAtom(pushBottomSheetAtom);
  const [data, setData] = useState<RecommendRequestParams>({
    type: 'RECOMMEND',
    price: '',
    text: '',
    isPublic: isShareChecked,
  });
  const disabled = !data.price;
  const handleSubmit = useCheckPoint(1, () => {
    addRequest(data);
    router.back();
  });

  const openShareDesc = () => {
    pushBottomSheet(
      [{
        type: 'title',
        text: '[선택사항] 픽포미 추천 함께 공유하기',
      }, {
        type: 'desc',
        text: '픽포미 추천 상품을 모두가 확인할 수 있게 리포트를 공유하는 기능이에요. 매월 최다 조회될 경우 1픽을 돌려받을 수 있어요. 개인 정보는 노출되지 않아요.',
      }]
    );
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
          <Link
            href={`/recommend-sample`}
            asChild
            accessibilityRole='button'
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
          (선택사항) 원하시는 상품의 특징(성별, 사이즈, 색상, 스타일 등)을 자유롭게 작성해 주세요.
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
        {/*
        <View style={styles.checkWrap}>
          <Pressable onPress={() => setIsShareChecked(prev => !prev)}
            accessibilityRole='checkbox' accessible
            style={styles.checkWrapRow}
          >
            <CheckBox
              checked={isShareChecked}
              onPress={() => setIsShareChecked(prev => !prev)}
            />
            <Text style={styles.checkText} accessibilityLabel={`[선택사항] 픽포미 추천 함께 공유하기 ${isShareChecked ? '선택됨' : '선택안됨'}`}>
              [선택사항] 픽포미 추천 함께 공유하기
            </Text>
          </Pressable>
          <Pressable onPress={openShareDesc} accessibilityRole='button' accessibilityLabel='자세히 보기'>
            <Image style={styles.checkMore} source={require('../assets/images/ChevronRight.png')} />
          </Pressable>
        </View>
        */}
        <Button title='1픽으로 추천 의뢰하기' onPress={handleSubmit} disabled={disabled} />
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
    flexDirection: 'column',
    padding: 20,
  },
  checkWrap: {
    marginBottom: 19,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
  },
  checkWrapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: 11,
  },
  check: {
    flexShrink: 0,
  },
  checkText: {
    fontSize: 14,
    fontWeight: '500',
    flexGrow: 1,
  },
  checkMore: {
    flexShrink: 0,
    width: 8,
    height: 15,
  },
});
