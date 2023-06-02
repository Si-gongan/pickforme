import React from 'react';
import { useRouter } from "expo-router";
import { View, Text } from './Themed';
import Button from './Button';
import { Chat as IChat } from '../stores/request/types';
import { Image, StyleSheet, Pressable, useColorScheme } from 'react-native';

interface Props {
  data: IChat,
}
const Chat: React.FC<Props> = ({ data }) => {
  const router = useRouter();
  const button = data.button;
  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.text}>
          {data.text}
        </Text>
        {button && (
          <Button
            style={styles.button}
            title={button.text}
            onPress={() => router.push(button.deeplink)}
          />
        )}
      </View>
      <View style={styles.dateWrap}>
        <Text style={styles.dateText}>
          {data.createdAt}
        </Text>
      </View> 
    </View>
  );
}

export default Chat;

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: 10,
  },
  card: {
    maxWidth: '60%',
  },
  button: {
    marginTop: 12,
  },
  text: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 17,
  },
  dateWrap: {

  },
  dateText: {
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 12,
  },
});
