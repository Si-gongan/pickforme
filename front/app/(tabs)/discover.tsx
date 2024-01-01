import React from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';

import Colors from '../../constants/Colors';
import { getRequestsAtom, requestsAtom } from '../../stores/request/atoms';
import Button from '../../components/Button';
import { Text, View } from '../../components/Themed';
import { formatDate } from '../../utils/common';
import useColorScheme, { ColorScheme } from '../../hooks/useColorScheme';

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
      <Text style={styles.title}>탐색</Text>
      <ScrollView style={styles.scrollView}>
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
  scrollView: {
    marginTop: 35,
    flex: 1,
  },
});
