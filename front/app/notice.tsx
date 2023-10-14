import React from "react";
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '../components/Themed';

export default function NoticeScreen() {
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
        <Text>등록된 공지사항이 없습니다.</Text>
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
});
