import { useRouter } from "expo-router";
import React from "react";
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
import { StyleSheet, Pressable, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
import Colors from '../constants/Colors';
import Button from '../components/Button';
import { Text, View } from '../components/Themed';
import { useAtomValue, useSetAtom } from 'jotai';
import { userDataAtom } from '../stores/auth/atoms';
import { getPickHistoryAtom, pickHistoryAtom, subscriptionAtom } from '../stores/purchase/atoms';
import { formatTime, formatDate } from '../utils/common';

export default function PointHistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const currentSubscription = useAtomValue(subscriptionAtom);
  const userData = useAtomValue(userDataAtom);
  const historys = useAtomValue(pickHistoryAtom);
  const getPickHistory = useSetAtom(getPickHistoryAtom);
  const styles = useStyles(colorScheme);
  React.useEffect(() => {
    getPickHistory();
  }, [getPickHistory]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.myPoint}>
            <Text style={styles.myPointText}>
              내 픽
            </Text>
            <Text style={styles.myPointNumber}>
              {userData?.point}픽
            </Text>
          </View>
          {!!currentSubscription && (
          <View style={[styles.myPoint, styles.titleMargin]}>
            <Text style={styles.myPointText}>
              내 멤버십
            </Text>
            <Text style={styles.myPointNumber}>
              {currentSubscription.product.displayName}
            </Text>
          </View>
          )}
          <View style={styles.seperator} />
          <Text style={[styles.myPointText, styles.titleMargin]}>
            픽 충전 및 이용 내역
          </Text>
          <View style={styles.history}>
          {historys?.map((history) => (
            <View style={styles.row}>
              <Text style={styles.date} color='secondary'>
                {`${formatDate(history.createdAt)} ${formatTime(history.createdAt)}`}
              </Text>
              <View style={styles.rowInner}>
                <Text style={styles.usage}>
                  {history.usage}
                </Text>
                <Text style={styles.diff}>
                  {`${history.diff > 0 ? '+' : ''}${history.diff}`}
                </Text>
              </View>
              <Text style={styles.point}>
                {`남은 픽 ${history.point}`}
              </Text>
            </View>
          ))}
          </View>
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
    myPoint: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myPointText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
  },
  myPointNumber: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 27,
  },
  seperator: {
    height: 2,
    width: '100%',
    marginTop: 20,
    marginBottom: 3,
    backgroundColor: Colors[colorScheme].buttonBackground.primary,
  },
  history: {
    flexDirection: 'column',
  },
  titleMargin: {
    marginTop: 24,
  },
  row: {
    flexDirection: 'column',
    marginTop: 8,
    paddingBottom: 12, 
    paddingTop: 19,
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderColor: Colors[colorScheme].borderColor.primary,
    marginBottom: 1,
  },
  rowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
  },
  usage: {
    fontSize: 16,
    fontWeight: '600',
  },
  diff: {
    fontSize: 16,
    fontWeight: '600',
  },
  point: {
    textAlign: 'right',
    fontSize: 12,
  },
});
