import { useRouter , Link } from "expo-router";
import React from "react";
import { StyleSheet, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
import Button from '../../../../components/Button';
import { Text, View } from '../../../../components/Themed';
import styles from './styles';
import { BUTTONS } from './constants';

export default function HowScreen() {
  const router = useRouter();
  const [value, setValue] = React.useState('small');

  return (
    <View style={styles.container}>
      <ScrollView>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.title}>안녕하세요. 쇼핑 도우미 서비스,</Text>
          <Text style={styles.title}>픽포미에 오신 것을 환영합니다</Text>
        </View>
        <Text style={styles.desc}>
          애플리케이션의 화면 구성과
        </Text>
        <Text style={styles.desc}>
          픽포미가 제공하는 서비스를 설명드릴게요.
        </Text>
      </View>
      <View style={localStyles.buttonWrap}>
        {BUTTONS.map(({ name, label }) => (
          <Button key={`how-button-${name}`} title={label} onPress={() => router.push(`/(tabs)/mypage/how/${name}`)} />
        ))}
      </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  buttonWrap: {
    marginTop: 70,
    paddingHorizontal: 43,
    flex: 1,
    gap: 44,
  },
  highlight: {
    fontWeight: '600',
  },
  textWrap: {
    flexDirection: 'row',
  },
});
