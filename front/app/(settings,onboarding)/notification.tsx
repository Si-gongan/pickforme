import { useRouter, usePathname } from "expo-router";
import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useAtomValue, useSetAtom } from "jotai";
import { RadioButton } from "react-native-paper";

import { Colors } from "@constants";
import { Text, View, Button } from "@components";
import { useColorScheme } from "@hooks";
import { setPushSettingAtom, userDataAtom, PushService } from "@stores";

import type { ColorScheme } from "@hooks";
import type { SetPushSettingParams } from "@stores";

const translationMap: {
  service: {
    [key in PushService]: string;
  };
} = {
  service: {
    off: "OFF",
    on: "ON",
  },
};

export default function ThemeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const userData = useAtomValue(userDataAtom);
  const [setting, setSetting] = React.useState<SetPushSettingParams>(
    userData!.push
  );
  const setPushSetting = useSetAtom(setPushSettingAtom);
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const handleSubmit = () => {
    setPushSetting(setting);
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.scrollContainer}>
          <Text style={styles.title}>서비스 알림</Text>
          {Object.entries(translationMap.service).map(([key, label], i) => {
            return (
              <React.Fragment key={`Notification-service-${key}`}>
                {i !== 0 && <View style={styles.seperator} />}
                <View style={styles.row}>
                  <Text style={styles.label} accessible={false}>
                    {label}
                  </Text>
                  <RadioButton.Android
                    color={Colors[colorScheme].text.primary}
                    value={key}
                    accessibilityLabel={
                      (key === setting.service ? "선택됨," : "") +
                      (key === "on" ? "알림 켜기" : "알림 끄기")
                    }
                    status={key === setting.service ? "checked" : "unchecked"}
                    onPress={() =>
                      setSetting((prev) => ({
                        ...prev,
                        service: key as PushService,
                      }))
                    }
                  />
                </View>
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.buttonWrap}>
        <Button title="확인" onPress={handleSubmit} />
      </View>
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    title: {
      fontWeight: "600",
      fontSize: 20,
      lineHeight: 24,
      marginBottom: 30,
    },
    seperator: {
      height: 1,
      backgroundColor: Colors[colorScheme].borderColor.secondary,
    },
    buttonWrap: {
      width: "100%",
      padding: 20,
    },
    row: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 18,
    },
    label: {
      flex: 1,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 17,
    },
    scrollContainer: {
      paddingVertical: 32,
      paddingHorizontal: 33,
    },
  });
