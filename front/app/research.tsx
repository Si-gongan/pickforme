import { useState } from 'react';
import { TextInput, ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSetAtom, useAtomValue } from 'jotai';
import * as Clipboard from 'expo-clipboard';

import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
import { previewAtom, getPreviewAtom, addRequestAtom } from '../stores/request/atoms';
import { ResearchRequestParams } from '../stores/request/types';
import Colors from '../constants/Colors';

import Button from '../components/Button';
import { Text, View } from '../components/Themed';

export default function ResearchScreen() {
  const router = useRouter();
  const addRequest = useSetAtom(addRequestAtom);
  const getPreview = useSetAtom(getPreviewAtom);
  const preview = useAtomValue(previewAtom);
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const [data, setData] = useState<ResearchRequestParams>({
    type: 'RESEARCH',
    link: '',
    text: '',
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
  const disabled = !data.link;
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
            매니저가 참고해야 하는 점이 있으면 알려주세요.
          </Text>
          <View style={styles.textAreaContainer} >
            <TextInput
              style={[styles.textArea, styles.textAreaBig]}
              underlineColorAndroid="transparent"
              numberOfLines={4}
              multiline={true}
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonWrap}>
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
  buttonWrap: {
    padding: 20,
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
