import { TextInput, ScrollView, StyleSheet, Pressable, Image, Platform, KeyboardAvoidingView, } from 'react-native';
import { FlatList } from 'react-native-gesture-handler'

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtomValue, useSetAtom, useAtom } from 'jotai';
import { useEffect, useState, useRef } from 'react';
import { userDataAtom } from '../stores/auth/atoms';
import { sendChatParamsAtom, sendChatAtom, isSendChatLoadingAtom, getRequestAtom, requestsAtom } from '../stores/request/atoms';
import { SendChatParams, RequestStatus } from '../stores/request/types';
import Colors from '../constants/Colors';
import Button from '../components/Button';
import { Text, View } from '../components/Themed';
import Chat from '../components/Chat';
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';

const FLOAT_SAMPLES = [
  '3만원 이하의 과일 추천해줄래?',
  '하늘색 모자 추천해줘',
  '파스타 만들 때 필요한 재료를 추천해줘',
];
export default function ChatScreen() {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const getRequest = useSetAtom(getRequestAtom);
  const router = useRouter();
  const userData = useAtomValue(userDataAtom);
  const params = useLocalSearchParams();
  const sendChat = useSetAtom(sendChatAtom);
  const [data, setData] = useAtom(sendChatParamsAtom)
  const requests = useAtomValue(requestsAtom);
  const request = requests.find(({ _id }) => _id === `${data.requestId}`);
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const isSendChatLoading = useAtomValue(isSendChatLoadingAtom);
  const handleClickSend = () => {
    sendChat();
  }
  useEffect(() => {
    setData({ text: '', requestId: (params.requestId as string || '') });
  }, [params.requestId, setData]);
  const chats = request?.chats || [];
  useEffect(() => {
    if (data.requestId) {
      getRequest({ requestId: data.requestId });
    }
  }, [chats?.length, getRequest, data.requestId]);

  const handleClickSample = (sample:string) => {
    setData({ ...data, text: sample });
    sendChat();
  }

  const lastChat = chats[chats.length - 1];

  const showSample = chats.length === 0 && !params.requestId && !isSendChatLoading;
  const showBottomSample = !!lastChat?.questions?.length;
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, flexDirection: 'column' }}
      keyboardVerticalOffset={64}
      behavior={Platform.select({ android: undefined, ios: 'padding' })}
     >
    <View style={[{ flex: 1, flexDirection: 'row'}, showSample && { alignItems: 'center' }]}>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        <View style={[styles.inner, showBottomSample && { paddingBottom: 50 }]}>
          {showSample && (
          <View style={styles.floatSampleRoot}>
          <Text style={styles.floatSampleTitle}>
            {`대화를 통해 상품을 추천해주는 AI 포미와\n아래 버튼을 눌러 대화를 시작해보세요!`}
          </Text>
          <View style={styles.floatSampleWrap}>
          {FLOAT_SAMPLES.map(sample => (
            <Button
              onPress={() => handleClickSample(sample)} key={`AI-Sample-${sample}`} style={styles.floatSample}
              color='tertiary'
              title={sample}
            />
          ))}
        </View>
          </View>
          )}
          {chats.map((chat) => <Chat key={`Chat-${chat._id}`} data={chat} requestType={request?.type} />)}
        </View>
      </ScrollView>
      {showBottomSample && (
        <View style={styles.bottomFloatSampleWrap}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled
            contentContainerStyle={styles.bottomFloatSampleList}
            data={lastChat.questions}
            keyExtractor={(question) => `bottom-sample-question-${question}`}
            ItemSeparatorComponent={() => <View style={styles.seperator} accessible={false} />}
            renderItem={({ item: sample }) => (
            <Button
              onPress={() => handleClickSample(sample)}
              style={styles.bottomFloatSample}
              title={sample}
              color='secondary'
              size='small'
            />
            )}
          />
          </View>
        )}
    </View>
      {request?.status === RequestStatus.CLOSED ? (
        <>
        <Text style={styles.closedText} color='secondary'>
          채팅이 완료되었습니다.{`\n`}
          새로운 의뢰를 원하실 경우 아래 ‘새로 의뢰하기’ 버튼을 눌러주세요.
        </Text>
        <View style={styles.buttonWrap}>
          <View style={styles.buttonItem}>
            <Button variant='text' title='새로 의뢰하기' color='tertiary' onPress={() => router.push(`/${request.type.toLowerCase()}`)} />
          </View>
          <View style={styles.buttonSeperator} />
          <View style={styles.buttonItem}>
            <Button variant='text' title='AI와 대화하기' color='tertiary' onPress={() => router.push('/(tabs)/AI')} />
          </View>
        </View>
        </>
      ) : (
      <View style={styles.inputView}>
        <View style={styles.inputWrap}>
          <TextInput
            style={[styles.textArea]}
            underlineColorAndroid="transparent"
            multiline
            textAlignVertical='top'
            value={data.text}
            accessible
            accessibilityLabel="메세지 입력창"
            onChangeText={(text) => setData({ ...data, text })}
          />
          <Button
            style={styles.sendButton}
            onPress={handleClickSend}
            size='small'
            color='primary'
            accessible
            accessibilityLabel="전송"
          >
            <Image style={styles.sendIcon} source={require('../assets/images/chat/send.png')} />
          </Button>
        </View>
      </View>
      )}
    </KeyboardAvoidingView>
  );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  inner: {
    padding: 20,
    paddingBottom: 0,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  inputView: {
    backgroundColor: Colors[colorScheme].buttonBackground.primary,
    paddingTop: 14,
    paddingBottom: 32,
    paddingHorizontal: 21,
    minHeight: 84,
    flexDirection: 'row',
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    minHeight: 31,
    paddingLeft: 15,
    paddingVertical: 3,
    paddingRight: 4,
    borderRadius: 18,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  sendButton: {
    width: 52,
    height: 31,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
    marginBottom: 8,
    fontSize: 14,
  },
  sendIcon: {
  },
  buttonWrap: {
    borderTopWidth: 1,
    borderColor: Colors.light.buttonBackground.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonItem: {
    flex: 0.5,
    paddingVertical: 10,
  },
  buttonSeperator: {
    width: 1,
    height: 49,
    backgroundColor: Colors.light.borderColor.primary,
  },
  closedText: {
    marginTop: 20,
    textAlign: 'center',
    alignItems: 'center',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 15,
    marginBottom: 39,
  },
  floatSampleTitle: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 66,
  },
  floatSampleWrap: {
    flexDirection: 'column',
    gap: 18,
  },
  floatSampleText: {
    fontSize: 14,
    fontWeight: '400',
  },
  floatSample: {
    paddingTop: 22,
    paddingBottom: 22,
    borderRadius: 12,
    textAlign: 'center',
    width: '100%',
  },
  floatSampleRoot: {
    flex: 1,
  },
  bottomFloatSampleWrap: {
    position: 'absolute',
    backgroundColor: 'transparent',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomFloatSampleList: {
    flexDirection: 'row',
    paddingBottom: 22,
    backgroundColor: 'transparent',
    paddingLeft: 20,
  },
  bottomFloatSample: {
    paddingHorizontal: 15,
  },
  seperator: {
    height: 1,
    backgroundColor: 'transparent',
    width: 8,
  },
});
