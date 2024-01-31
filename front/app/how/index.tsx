import { useRouter , Link } from "expo-router";
import React from "react";
import { StyleSheet, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
import Button from '../../components/Button';
import { Text, View } from '../../components/Themed';
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
          <Text style={styles.title}>{`안녕하세요. 시각장애인을 위한\n쇼핑 앱 픽포미에 오신 것을 환영합니다.`}</Text>
        </View>
        <Text style={styles.desc}>{`앱의 화면 구성과 픽포미 서비스를 설명해 드릴게요.`}</Text>
      </View>
      <View style={localStyles.buttonWrap}>
        {BUTTONS.map(({ name, label }) => (
          <Button key={`how-button-${name}`} title={label} onPress={() => router.push(`/how/${name}`)} />
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
