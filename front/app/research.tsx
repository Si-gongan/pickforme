import { useState } from 'react';
import { TextInput, ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useRouter, Link,  useLocalSearchParams } from 'expo-router';
import { useSetAtom, useAtomValue } from 'jotai';
import * as Clipboard from 'expo-clipboard';

import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
import { previewAtom, getPreviewAtom, addRequestAtom } from '../stores/request/atoms';
import { ResearchRequestParams } from '../stores/request/types';
import Colors from '../constants/Colors';
import CheckBox from '../components/CheckBox';
import { pushBottomSheetAtom } from '../stores/layout/atoms';


import Button from '../components/Button';
import { Text, View } from '../components/Themed';

export default function ResearchScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const addRequest = useSetAtom(addRequestAtom);
  const getPreview = useSetAtom(getPreviewAtom);
  const preview = useAtomValue(previewAtom);
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
    const pushBottomSheet = useSetAtom(pushBottomSheetAtom);
  const [isShareChecked, setIsShareChecked] = useState(false);

  const [data, setData] = useState<ResearchRequestParams>({
    type: 'RESEARCH',
    link: params.link ? decodeURIComponent(`${params.link}`) : '',
    text: '',
    isPublic: isShareChecked,
  });
  const handleClickPaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      getPreview({ link: text });
      setData({ ...data, link: text });
    }
  }
  const handleClickReset = () => {
    setData({ ...data, link: '' });
  }
  const handleSubmit = () => {
    addRequest(data);
    router.push('(tabs)/requests')
  }
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
  const disabled = !data.link;
  return (
    <View style={styles.container}>
      <ScrollView
        scrollEnabled
      >
        <View style={[styles.container, styles.containerInner]}>
          <Text style={styles.title}>
            궁금한 상품의 상세페이지를 설명드릴게요!
          </Text>
          <Link
            href={`/research-sample`}
            asChild
          >
            <Button style={styles.button} textStyle={styles.buttonText} title='작성 예시' size='medium' />
          </Link>
          <Text style={styles.label}>
            상품의 링크를 입력해주세요.
          </Text>
          <View style={styles.buttonRow}>
            <View style={styles.linkButton}>
              <Button
                color='tertiary'
                onPress={handleClickPaste}
                size='small'
                numberOfLines={1}
                title={data.link || '터치하여 붙여넣기'}
                textStyle={styles.linkButtonText}
              />
            </View>
            {!!data.link && (
              <Button
                color='secondary'
                onPress={handleClickReset}
                size='small'
                title='초기화'
                style={styles.resetButton}
              />
            )}
          </View>
          {!!preview ? (
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
          ) : <View style={styles.empty} />}
          <Text style={styles.label}>
            상품에 대해 궁금한 점을 적어주세요.
          </Text>
          <View style={styles.textAreaContainer} >
            <TextInput
              style={[styles.textArea, styles.textAreaBig]}
              underlineColorAndroid="transparent"
              numberOfLines={4}
              textAlignVertical='top'
              multiline
              onChangeText={(text) => setData({ ...data, text })}
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonWrap}>
        <View style={styles.checkWrap}>
          <CheckBox
            checked={isShareChecked}
            onPress={() => setIsShareChecked(prev => !prev)}
          />
          <Text style={styles.checkText}>[선택사항] 픽포미 추천 함께 공유하기</Text>
          <Pressable onPress={openShareDesc}>
            <Image style={styles.checkMore} source={require('../assets/images/ChevronRight.png')} />
          </Pressable>
        </View>
        <Button title='1픽 사용하여 분석 의뢰하기' onPress={handleSubmit} disabled={disabled} />
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
    height: 73,
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
    flexDirection: 'row',
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
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  linkButton: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  linkButtonText: {
    fontWeight: '400',
    paddingHorizontal: 11,
    width: '100%',
    fontSize: 12,
    lineHeight: 15,
  },
  resetButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
  },
  meta: {
    marginBottom: 30,
    borderWidth: 1,
    borderColor: Colors[colorScheme].borderColor.primary,
    borderRadius: 15,
    marginTop: 20,
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
