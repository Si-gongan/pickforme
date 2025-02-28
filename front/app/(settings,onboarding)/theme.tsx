import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { useAtom } from "jotai";
import { RadioButton } from "react-native-paper";

import Button from "../../components/Button";
import { settingAtom } from "../../stores/auth/atoms";
import { Colors } from "@constants";
import { useColorScheme } from "@hooks";
import { Text, View } from "@components";

const translationMap = {
  default: "휴대폰 설정과 동일하게",
  light: "밝은 모드",
  dark: "어두운 모드",
};

export default function ThemeScreen() {
  const { segment = "" } = useLocalSearchParams();
  const [setting, setSetting] = useAtom(settingAtom);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isSetting = segment.includes("settings");
  const [theme, setTheme] = React.useState<string>(setting.theme ?? "default");
  const handleSubmit = () => {
    setSetting({
      ...setting,
      theme: theme as (typeof setting)["theme"],
    });
    if (isSetting) {
      router.back();
    } else {
      router.push("(onboarding)/greeting");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>화면 모드를 선택해주세요.</Text>
        {Object.entries(translationMap).map(([key, label]) => {
          return (
            <View style={styles.row} key={`Onboard-theme-${key}`}>
              <Text style={styles.label} accessible={false}>
                {label}
              </Text>
              <RadioButton.Android
                color={Colors[colorScheme].text.primary}
                value={key}
                accessibilityLabel={(key === theme ? "선택됨," : "") + label}
                status={key === theme ? "checked" : "unchecked"}
                onPress={() => setTheme(key)}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.buttonWrap}>
        <Button title="확인" onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "600",
    fontSize: 22,
    lineHeight: 27,
    marginBottom: 30,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonWrap: {
    width: "100%",
    padding: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 70,
    paddingRight: 67,
    paddingTop: 62,
  },
  label: {
    flex: 1,
    fontWeight: "700",
    fontSize: 18,
    lineHeight: 22,
  },
});
