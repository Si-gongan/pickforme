import React from "react";
import { useSetAtom, useAtomValue } from 'jotai';
import { useRouter, Link } from 'expo-router';
import Colors from '../constants/Colors';

import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
import { StyleSheet, Pressable, ScrollView, FlatList } from 'react-native';
import { Text, View } from '../components/Themed';
import { getNoticesAtom, noticesAtom } from '../stores/notice/atoms';
import { formatDate } from '../utils/common';

export default function NoticeScreen() {
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
    const getNotices = useSetAtom(getNoticesAtom);
  const notices = useAtomValue(noticesAtom);

  React.useEffect(() => {
    getNotices();
  }, [getNotices]);

  return (
    <View style={styles.container}>
      <ScrollView>
    <View>
      <FlatList
        scrollEnabled={false}
        data={notices}
        ItemSeparatorComponent={() => <View style={styles.seperator} />}
        keyExtractor={(notice) => notice._id}
        renderItem={({ item: notice }) => (
          <Link
              href={`/notice?noticeId=${notice._id}`}
              style={styles.cardLink}
              asChild
            >
              <Pressable>
                {({ pressed }) => (
                  <View style={styles.card}>
                        <Text style={styles.name}>
                          {notice.title}
                        </Text>
                        <Text style={styles.date}>
                          {formatDate(notice.createdAt)}
                        </Text>
                  </View>
                )}
              </Pressable>
            </Link>
        )}
      />
      </View>
      </ScrollView>
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 34,
  },
  content: {
    paddingHorizontal: 27,
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
    paddingVertical: 20,
    marginHorizontal: 25,
    flexDirection: 'column',
  },
  name: {
    fontWeight: '400',
    fontSize: 16,
    marginBottom: 4,
  },
  date: {
    fontWeight: '400',
    fontSize: 14,
  },
  preview: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 15,
    paddingRight: 30,
  },
  seperator: {
    height: 1,
    flexGrow: 1,
    marginHorizontal: 25,
    backgroundColor: Colors[colorScheme].borderColor.primary,
  },
});
