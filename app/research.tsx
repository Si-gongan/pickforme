import { useState } from 'react';
import { TextInput, ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useSetAtom } from 'jotai';
import * as Clipboard from 'expo-clipboard';
const cheerio = require('react-native-cheerio');

import { addRequestAtom } from '../stores/request/atoms';
import { ResearchRequestParams } from '../stores/request/types';
import Colors from '../constants/Colors';

import Button from '../components/Button';
import { Text, View } from '../components/Themed';

const fetchHtml = async (link: string) => {
    return await axios.get(link);
};

type MetaData = any;
const parseHtml = (html: string) => {
    const properties = ['title', 'description', 'image', 'url'];
    const meta: MetaData = {};
    const cheerio = require('react-native-cheerio');
    const $ = cheerio.load(html);
    properties.forEach((p) => {
        const content = $(`meta[property="og:${p}"]`).attr('content');
        if (content) {
          meta[p] = content;
        }
    });
    return meta;
};

const findOGTags = async (link: string) => {
    try{
      const response = await fetchHtml(link);
      console.log(response);
      /*
      const meta = await parseHtml(response);
      return meta;
      */
      return {};
    }catch(e){
      console.log(e)
    }
}

export default function ResearchScreen() {
  const router = useRouter();
  const addRequest = useSetAtom(addRequestAtom);
  const [meta, setMeta] = useState<MetaData>();
  const [data, setData] = useState<ResearchRequestParams>({
    type: 'RESEARCH',
    link: '',
    text: '',
  });
  const handleClickPaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setData({ ...data, link: text });
      setMeta(await findOGTags(text));
    }
  }
  const handleClickReset = () => {
    setData({ ...data, link: '' });
  }
  const handleSubmit = () => {
    addRequest(data);
    router.push('(tabs)/chat')
  }
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
          <View style={styles.meta}>
            {!!data.link && (
              <View></View>
            )}
          </View>
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
        <Button title='분석 의뢰하기 500P' onPress={handleSubmit} />
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
  },
});
