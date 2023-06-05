import React from 'react';
import { useRouter } from "expo-router";
import { View, Text } from './Themed';
import Button from './Button';

import Colors from '../constants/Colors';
import { Chat as IChat } from '../stores/request/types';
import { Image, StyleSheet, Pressable, useColorScheme } from 'react-native';

interface Props {
  data: IChat,
}
const Chat: React.FC<Props> = ({ data }) => {
  const router = useRouter();
  const button = data.button;
  return (
    <View style={[styles.root, data.isMine && styles.isMine]}>
      <View style={styles.card}>
        <Text style={styles.text}>
          {data.text}
        </Text>
        {button && (
          <Button
            style={styles.button}
            title={button.text}
            color='secondary'
            size='small'
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
    marginBottom: 21,
  },
  isMine: {
    flexDirection: 'row-reverse',
  },
  card: {
    maxWidth: '60%',
    paddingVertical: 14,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: Colors.light.card.primary,
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
