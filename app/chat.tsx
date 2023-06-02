import { ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { userDataAtom } from '../stores/auth/atoms';
import { requestsAtom } from '../stores/request/atoms';

import Button from '../components/Button';
import { Text, View } from '../components/Themed';
import Chat from '../components/Chat';

export default function ChatScreen() {
  const router = useRouter();
  const userData = useAtomValue(userDataAtom);
  const { requestId } = useLocalSearchParams();
  const request = useAtomValue(requestsAtom).find(({ id }) => id === `${requestId}`);
  if (!request) {
    // 잘못된 접근입니다
    return null;
  }
  return (
    <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.container}>
      {request.chats.map((chat) => <Chat data={chat} />)}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
