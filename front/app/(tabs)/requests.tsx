import React from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

  import useColorScheme, { ColorScheme } from '../../hooks/useColorScheme';
import Colors from '../../constants/Colors';
import { getRequestsAtom, requestsAtom } from '../../stores/request/atoms';
import { RequestStatus } from '../../stores/request/types';
import Button from '../../components/Button';
import { Text, View } from '../../components/Themed';
import { formatDate } from '../../utils/common';

enum TABS {
  ALL = 'ALL',
  RECOMMEND = 'RECOMMEND',
  RESEARCH = 'RESEARCH',
};

const tabName = {
  [TABS.ALL]: '전체',
  [TABS.RECOMMEND]: '픽포미 추천',
  [TABS.RESEARCH]: '픽포미 분석',
}

const statusName = {
  [RequestStatus.CLOSED]: '의뢰 종료',
  [RequestStatus.PENDING]: '리포트 작성중',
  [RequestStatus.SUCCESS]: '리포트 도착',
}
export default function RequestsScreen() {
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const [tab, setTab] = React.useState<TABS>(TABS.ALL);
  const getRequests = useSetAtom(getRequestsAtom);
  const requests = useAtomValue(requestsAtom)
    .filter(request => request.type !== 'AI')
    .filter(request => tab === 'ALL' ? true : request.type === tab);

  React.useEffect(() => {
    getRequests();
  }, [getRequests]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>의뢰 목록</Text>
      <Text style={styles.subtitle}>채팅방에 입장하여 의뢰 진행상황을 확인하세요</Text>
      <View style={styles.tabWrap}>
        {Object.values(TABS).map((TAB) => (
          <View style={styles.tab} key={`Requests-Tab-${TAB}`}>
            <Button
              style={styles.tabButton}
              title={tabName[TAB]}
              size='medium'
              color={tab === TAB ? 'primary' : 'tertiary'}
              onPress={() => setTab(TAB)}
              accessibilityLabel={`${tabName[TAB]} 의뢰목록 보기`}
            />
          </View>
        ))}
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.cards}>
          {requests.map((request) => (
            <Link
              href={`/chat?requestId=${request._id}`}
              key={`Request-card-${request._id}`}
              style={styles.cardLink}
              asChild
            >
              <Pressable
                accessible={false}
              >
                {({ pressed }) => (
                  <View style={styles.card}>
                    <View style={styles.row}>
                      <View style={styles.rowLeft}>
                        <Text
                          style={styles.name}
                          numberOfLines={1}
                          accessible
                          accessibilityLabel={`${request.name} 채팅방에 입장하려면 이중탭하세요`}
                        >
                          {request.name}
                        </Text>
                        <Text style={styles.date}
                          accessibilityHint={'마지막 채팅 날짜'}
                        >
                          {formatDate(request.chats.slice(-1)?.[0]?.createdAt)}
                        </Text>
                      </View>
                      <Button
                        style={styles.status}
                        size='small'
                        color={request.status !== 'CLOSED' ? 'secondary' : 'primary'}
                        title={statusName[request.status]}
                        accessibilityHint={'의뢰 상태 텍스트'}
                        readOnly
                      />
                    </View>
                    <Text style={styles.preview} numberOfLines={1} accessible={false} accessibilityLabel={''} importantForAccessibility={'no'}>
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
    flexShrink: 1,
    marginRight: 10,
  },
  rowRight: {
  },
  name: {
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 17,
    marginRight: 9,
    flexShrink: 1,
  },
  date: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 15,
    flexShrink: 0,
  },
  preview: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 15,
    paddingRight: 30,
  },
  status: {
    flexShrink: 0,
    paddingHorizontal: 18,
  },
  unread: {
    backgroundColor: '#E46A6A',
    width: 25,
    height: 25,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
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
