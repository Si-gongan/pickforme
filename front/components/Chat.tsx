import React from 'react';
import { useRouter } from "expo-router";
import { View, Text } from './Themed';
import Button from './Button';

import Colors from '../constants/Colors'
import Autolink from 'react-native-autolink';
import useColorScheme, {ColorScheme } from '../hooks/useColorScheme';
import { formatTime } from '../utils/common';
import { Request, Chat as IChat } from '../stores/request/types';
import { Image, StyleSheet, Pressable } from 'react-native';

interface Props {
  data: IChat,
  requestType: Request['type'] | undefined,
}
const Chat: React.FC<Props> = ({ data, requestType }) => {
  const router = useRouter();
  const button = data.button;
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const date = formatTime(data.createdAt);
  const from = requestType === 'AI' ? 'AI 포미' : '픽포미 매니저';
  const accessibilityLabel = `${data.isMine ? '' : `${from} `} ${data.text} ${date}`;
  return (
    <View
      style={[styles.root, data.isMine && styles.isMine]}
      accessible
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.card}>
        <Autolink
          style={styles.text}
          text={data.text}
          linkStyle={styles.link}
          renderText={(text) => <Text style={styles.text}>{text}</Text>}
        />
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
          {date}
        </Text>
      </View> 
    </View>
  );
}

export default Chat;

const useStyles = (colorScheme: ColorScheme) =>  StyleSheet.create({
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
    backgroundColor: Colors[colorScheme].card.primary,
  },
  button: {
    marginTop: 12,
  },
  text: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 17,
  },
  link: {
    textDecorationLine: 'underline',
    color: Colors[colorScheme].text.primary,
  },
  dateWrap: {
  },
  dateText: {
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 12,
  },
});
