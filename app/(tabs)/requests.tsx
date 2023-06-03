import React from 'react';
import { useAtomValue } from 'jotai';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import Colors from '../../constants/Colors';
import { requestsAtom } from '../../stores/request/atoms';
import Button from '../../components/Button';
import { Text, View } from '../../components/Themed';

enum TABS {
  ALL = 'ALL',
  RECOMMEND = 'RECOMMEND',
  RESEARCH = 'RESEARCH',
};
export default function RequestsScreen() {
  const [tab, setTab] = React.useState<TABS>(TABS.ALL);
  const requests = useAtomValue(requestsAtom).filter(request => tab === 'ALL' ? true : request.type === tab);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>의뢰 목록</Text>
      <Text style={styles.subtitle}>아래 탭을 선택하여 채팅을 모아서 보세요.</Text>
      <View style={styles.tabWrap}>
        {Object.values(TABS).map((TAB) => (
          <View style={styles.tab} key={`Requests-Tab-${TAB}`}>
            <Button
              style={styles.tabButton}
              title={TAB}
              size='medium'
              color={tab === TAB ? 'primary' : 'tertiary'}
              onPress={() => setTab(TAB)}
            />
          </View>
        ))}
      </View>
      <ScrollView style={styles.scrollView}>
        <View>
          {requests.map((request) => (
            <Link
              href={`/chat?requestId=${request.id}`}
              key={`Request-card-${request.id}`}
              style={styles.cardLink}
              asChild
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
                          {new Date(request.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Button
                        style={styles.status}
                        title={request.status}
                        size='small'
                        color={request.status !== 'CLOSED' ? 'secondary' : 'primary'}
                        disabled={request.status === 'CLOSED'}
                      />
                    </View>
                    <Text style={styles.preview} numberOfLines={1}>
                      {request.chats[0]?.text || ''}
                    </Text>
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

const styles = StyleSheet.create({
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
    backgroundColor: Colors.light.card.primary,
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
  },
  status: {
    paddingHorizontal: 18,
  },
});
