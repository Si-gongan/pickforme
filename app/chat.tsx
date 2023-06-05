import { TextInput, ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { userDataAtom } from '../stores/auth/atoms';
import { sendChatAtom, requestsAtom } from '../stores/request/atoms';
import { SendChatParams } from '../stores/request/types';
import Colors from '../constants/Colors';
import Button from '../components/Button';
import { Text, View } from '../components/Themed';
import Chat from '../components/Chat';

export default function ChatScreen() {
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
      <ScrollView contentContainerStyle={styles.inner}>
        {request.chats.map((chat) => <Chat key={`Chat-${chat._id}`} data={chat} />)}
      </ScrollView>
      <View style={styles.inputView}>
        <View style={styles.inputWrap}>
          <TextInput
            style={[styles.textArea]}
            underlineColorAndroid="transparent"
            multiline
            value={data.text}
            onChangeText={(text) => setData({ ...data, text })}
          />
        </View>
        <Button
          style={styles.sendButton}
          title='전송'
          onPress={handleClickSend}
          size='small'
          color='tertiary'
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 20,
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
    paddingHorizontal: 15,
    paddingBottom: 5,
    borderRadius: 18,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  sendButton: {
    width: 60,
    height: 37,
  },
  textArea: {
  },
});
