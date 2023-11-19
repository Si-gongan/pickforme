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
import * as WebBrowser from 'expo-web-browser';


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
    const handleOpenUrl = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  }

  return (
    <>
    <View
      style={[styles.root, data.isMine && styles.isMine]}
    >
      <View style={[styles.card, data.isMine && styles.cardMine]}>
        <Autolink
          style={styles.text}
          text={data.text}
          linkStyle={styles.link}
          renderText={(text) => <Text style={styles.text}>{text}</Text>}
          accessible
          accessibilityLabel={accessibilityLabel}
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
        <Text style={styles.dateText} accessible={false}>
          {date}
        </Text>
      </View> 
    </View>
    {data.products?.map((product) => (
      <Pressable onPress={() => handleOpenUrl(product.link)}>
      <View style={styles.productCard}>
        <Image style={styles.productImage} source={{ uri: product.thumbnail }} />
        <Text style={styles.productText}>
          {`${product.name}\n\n평점 ${product.rating} (${product.rating_total_count}명 평가)`}
        </Text>
      </View>
      </Pressable>
    ))}
    </>
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
    maxWidth: '64%',
    paddingVertical: 14,
    paddingHorizontal: 11,
    backgroundColor: Colors[colorScheme].card.primary,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
  },
  cardMine: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 0,
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
  productCard: {
    marginBottom: 10,
    maxWidth: '50%',
    backgroundColor: Colors[colorScheme].card.primary,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
  },
  productImage: {
    width: '100%',
    height: 126,
  },
  productText: {
    fontSize: 12,
    padding: 8,
  }
});
