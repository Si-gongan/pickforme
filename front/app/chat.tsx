import { TextInput, ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { useState, useRef } from 'react';
import { userDataAtom } from '../stores/auth/atoms';
import { sendChatAtom, requestsAtom } from '../stores/request/atoms';
import { SendChatParams, RequestStatus } from '../stores/request/types';
import Colors from '../constants/Colors';
import Button from '../components/Button';
import { Text, View } from '../components/Themed';
import Chat from '../components/Chat';

export default function ChatScreen() {
  const scrollViewRef = useRef<ScrollView | null>(null);

  const router = useRouter();
  const userData = useAtomValue(userDataAtom);
  const { requestId } = useLocalSearchParams();
  const sendChat = useSetAtom(sendChatAtom);
  const [data, setData] = useState<SendChatParams>({
    text: '',
    requestId: requestId as string, // local search params 이슈
  });
  const request = useAtomValue(requestsAtom).find(({ _id }) => _id === `${requestId}`);
  const handleClickSend = () => {
    sendChat(data);
    setData({ ...data, text: '' });
  }
  if (!request) {
    return <Text>잘못된 접근입니다</Text>
  }
  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        <View style={styles.inner}>
          {request.chats.map((chat) => <Chat key={`Chat-${chat._id}`} data={chat} />)}
        </View>
      </ScrollView>
      {request.status === RequestStatus.CLOSED ? (
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
            <Button variant='text' title='AI와 대화하기' color='tertiary' onPress={() => router.push('/ai')} />
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
            value={data.text}
            onChangeText={(text) => setData({ ...data, text })}
          />
          <Button
            style={styles.sendButton}
            onPress={handleClickSend}
            size='small'
            color='primary'
          >
            <Image style={styles.sendIcon} source={require('../assets/images/chat/send.png')} />
          </Button>
        </View>
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  inner: {
    padding: 20,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  inputView: {
    backgroundColor: Colors.light.buttonBackground.primary,
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
    marginTop: 12,
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
});
