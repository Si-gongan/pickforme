import React from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { Pressable, ScrollView, StyleSheet, Image } from 'react-native';
import { useRouter, Link } from 'expo-router';

import Colors from '../../constants/Colors';
import { getRequestsAtom, requestsAtom } from '../../stores/request/atoms';
import Button from '../../components/Button';
import { Text, View } from '../../components/Themed';
import { formatDate } from '../../utils/common';
import useColorScheme, { ColorScheme } from '../../hooks/useColorScheme';

import AIIcon from '../../assets/images/tabbar/AI.svg';

export default function RequestsScreen() {
  const router = useRouter();
  const getRequests = useSetAtom(getRequestsAtom);
  const requests = useAtomValue(requestsAtom).filter(request => request.type === 'AI');
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);

  React.useEffect(() => {
    getRequests();
  }, [getRequests]);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AIIcon style={styles.icon} />
        <Text style={styles.title}>AI 포미</Text>
      </View>
      <Text style={styles.subtitle}>AI 쇼핑 도우미 포미와 대화를 시작하세요</Text>
        <Button
          style={styles.newRequest}
          title='새 대화 시작하기'
          onPress={() => router.push('/chat')}
        />
      <ScrollView style={styles.scrollView}>
        <View style={styles.cards}>
          {requests.map((request) => (
            <Link
              href={`/chat?requestId=${request._id}`}
              key={`Request-card-${request._id}`}
              style={styles.cardLink}
              asChild
              accessibilityRole='button'
            >
              <Pressable>
                {({ pressed }) => (
                  <View style={styles.card}>
                    <View style={styles.row}>
                      <View style={styles.rowLeft}>
                        <Text style={styles.name}>
                          {request.name}
                        </Text>
                        <Text style={styles.date}>
                          {formatDate(request.chats.slice(-1)?.[0]?.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.preview} numberOfLines={1} accessible={false}>
                      {request.chats.slice(-1)?.[0]?.text || ''}
                    </Text>
                    {!!(request.unreadCount >= 1) && (
                      <View style={styles.unread}>
                        <Text style={styles.unreadText} accessibilityLabel={`안읽은 메세지 ${request.unreadCount}개`}>
                          {request.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
  },
  icon: {
    color: Colors[colorScheme].text.primary,
    marginRight: 9,
  },
  title: {
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 27,
    marginBottom: 13,
  },
  subtitle: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    marginBottom: 32,
  },
  tabWrap: {
    flexDirection: 'row',
    alignContent: 'stretch',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 13,
  },
  tab: {
    flex: 1,
  },
  tabButton: {
    flexDirection: 'row',
  },
  cards: {
    flexDirection: 'column-reverse',
  },
  scrollView: {
    marginTop: 35,
    flex: 1,
  },
  cardLink: {
  },
  card: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: Colors[colorScheme].card.primary,
    marginBottom: 13,
  },
  row: {
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  rowRight: {
  },
  name: {
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 17,
    marginRight: 9,
  },
  date: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 15,
  },
  preview: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 15,
    paddingRight: 30,
  },
  status: {
    paddingHorizontal: 18,
  },
  newRequest: {
    width: '100%',
  },
  unread: {
    backgroundColor: '#E46A6A',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    width: 25,
    height: 25,
    position: 'absolute',
    right: 13,
    bottom: 7,
  },
  unreadText: {
    lineHeight: 15,
    fontSize: 12,
    fontWeight: '600',
    color: '#EFEFEF',
  },
});
