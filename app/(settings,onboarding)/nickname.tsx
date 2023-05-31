import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TextInput } from 'react-native';
import { useAtom } from 'jotai';
import Button from '../../components/Button';
import { RadioButton } from 'react-native-paper';

import Colors from '../../constants/Colors';
import { Text, View } from '../../components/Themed';
import { settingAtom } from '../../stores/auth/atoms';
import { useLocalSearchParams } from "expo-router";


export default function NicknameScreen() {
  const [setting, setSetting] = useAtom(settingAtom);
  const router = useRouter();
  const { segment } = useLocalSearchParams();
  const [name, setName] = React.useState(setting.name ?? '');
  const [vision, setVision] = React.useState(setting.vision ?? 'none');

  const handleSubmit = () => {
    setSetting({
      ...setting,
      name,
      vision: vision as typeof setting['vision'],
    });
    if (segment === '(settings)') {
      router.back();
    } else {
      router.push('(onboarding)/theme');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>닉네임을 입력해주세요.</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            underlineColorAndroid="transparent"
            onChangeText={setName}
            value={name}
          />
        </View>
        <Text style={styles.title}>시각장애 정도를 선택해주세요.</Text>
          <View style={styles.row}>
          {['none', 'low', 'blind'].map((key, i) => (
            <React.Fragment key={`Onboard-vision-${key}`}>
              {i !== 0 && <View style={styles.bar} />}
              <View style={styles.item}>
                <Text style={styles.label}>{key}</Text>
                <RadioButton.Android
                  color={Colors.light.buttonBackground.primary}
                  value={key}
                  status={key === vision ? 'checked' : 'unchecked'}
                  onPress={() => setVision(key)}
                />
              </View>
            </React.Fragment>
          ))}
          </View>
        </View>
      <View style={styles.buttonWrap}>
        <Button title='확인' onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 27,
    marginBottom: 41,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'flex-start',
    padding: 41,
    justifyContent: 'center',
  },
  buttonWrap: {
    width: '100%',
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.borderColor.primary,
    marginTop: 15,
  },
  item: {
    backgroundColor: 'transparent',
  },
  label: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 17,
  },
  textAreaContainer: {
    width: '100%',
    borderColor: Colors.light.borderColor.primary,
    borderWidth: 1,
    padding: 5,
    marginBottom: 82,
  },
  textArea: {
    fontSize: 18,
  },
});
