import { useRouter, usePathname } from "expo-router";
import React from "react";
import { StyleSheet, ScrollView } from 'react-native';
import { useAtomValue, useSetAtom } from 'jotai';
import { RadioButton } from 'react-native-paper';

import Button from '../../../components/Button';
import Colors from '../../../constants/Colors';
import { Text, View } from '../../../components/Themed';
import { PushChat, PushService, SetPushSettingParams } from '../../../stores/auth/types';
import { setPushSettingAtom, userDataAtom } from '../../../stores/auth/atoms';

const translationMap: {
  chat: {
    [key in PushChat]: string;
  },
  service: {
    [key in PushService]: string;
  }
} = {
  chat: {
    off: '받지 않음',
    report: '결과 리포트 도착 시에만',
    all: '모든 채팅',
  },
  service: {
    off: 'OFF',
    on: 'ON',
  }
}

export default function ThemeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const userData = useAtomValue(userDataAtom);
  const [setting, setSetting] = React.useState<SetPushSettingParams>(userData!.push);
  const setPushSetting = useSetAtom(setPushSettingAtom);
  const handleSubmit = () => {
    setPushSetting(setting);
    router.back();
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>채팅 알림</Text>
            {Object.entries(translationMap.chat).map(([key, label], i) => {
              return (
                <React.Fragment key={`Notification-chat-${key}`}>
                  {i !== 0 && <View style={styles.seperator} />}
                  <View style={styles.row}>
                    <Text style={styles.label} accessible={false}>{label}</Text>
                    <RadioButton.Android
                      color={Colors.light.buttonBackground.primary}
                      value={key}
                      accessibilityLabel={`${label} 선택 버튼`}
                      status={key === setting.chat ? 'checked' : 'unchecked'}
                      onPress={() => setSetting((prev) => ({ ...prev, chat: key as PushChat }))}
                    />
                  </View>
                </React.Fragment>
              )
            })}
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>서비스 알림</Text>
            {Object.entries(translationMap.service).map(([key, label], i) => {
              return (
                <React.Fragment key={`Notification-service-${key}`}>
                  {i !== 0 && <View style={styles.seperator} />}
                  <View style={styles.row}>
                    <Text style={styles.label} accessible={false}>{label}</Text>
                    <RadioButton.Android
                      color={Colors.light.buttonBackground.primary}
                      value={key}
                      accessibilityLabel={`${label} 선택 버튼`}
                      status={key === setting.service ? 'checked' : 'unchecked'}
                      onPress={() => setSetting((prev) => ({ ...prev, service: key as PushService }))}
                    />
                  </View>
                </React.Fragment>
              )
            })}
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonWrap}>
        <Button title='확인' onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 30,
  },
  content: {
    marginBottom: 30,
  },
  seperator: {
    height: 1,
    backgroundColor: Colors.light.borderColor.secondary,
  },
  buttonWrap: {
    width: '100%',
    padding: 20,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
  },
  label: {
    flex: 1,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 17,
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 33,
  },
});
