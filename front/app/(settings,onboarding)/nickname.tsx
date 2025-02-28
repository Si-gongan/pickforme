import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, TextInput } from "react-native";
import { useAtom } from "jotai";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "../../components/Button";
import { RadioButton } from "react-native-paper";
import useColorScheme, { ColorScheme } from "../../hooks/useColorScheme";

import Colors from "../../constants/Colors";
import { Text, View } from "@components";
import { settingAtom } from "../../stores/auth/atoms";

const translationMap = {
  none: "비장애",
  low: "저시력",
  blind: "전맹",
};

export default function NicknameScreen() {
  const insets = useSafeAreaInsets();
  const { segment = "" } = useLocalSearchParams();
  const [setting, setSetting] = useAtom(settingAtom);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const isSetting = segment.includes("settings");
  const [name, setName] = React.useState(setting.name ?? "");
  const [vision, setVision] = React.useState<typeof setting.vision>(
    setting.vision ?? "none"
  );

  const handleSubmit = () => {
    setSetting({
      ...setting,
      name,
      vision: vision as (typeof setting)["vision"],
    });
    if (isSetting) {
      router.push("/(tabs)/mypage");
    } else {
      router.push("(onboarding)/intro");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>닉네임을 입력해주세요.</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            underlineColorAndroid="transparent"
            onChangeText={setName}
            accessibilityLabel="닉네임 입력창"
            value={name}
          />
        </View>
        <Text style={styles.title}>시각장애 정도를 선택해주세요.</Text>
        <View style={styles.row}>
          {Object.entries(translationMap).map(([key, label], i) => {
            return (
              <React.Fragment key={`Onboard-vision-${key}`}>
                {i !== 0 && <View style={styles.bar} />}
                <View style={styles.item}>
                  <Text
                    style={styles.label}
                    accessible={false}
                    importantForAccessibility="no"
                  >
                    {label}
                  </Text>
                  <RadioButton.Android
                    color={Colors[colorScheme].text.primary}
                    value={key}
                    accessibilityLabel={
                      (key === vision ? "선택됨," : "") + label
                    }
                    status={key === vision ? "checked" : "unchecked"}
                    onPress={() => setVision(key as (typeof setting)["vision"])}
                  />
                </View>
              </React.Fragment>
            );
          })}
        </View>
      </View>
      <View style={[styles.buttonWrap, { paddingBottom: insets.bottom + 16 }]}>
        <Button title="확인" onPress={handleSubmit} />
      </View>
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontWeight: "600",
      fontSize: 22,
      lineHeight: 27,
      marginBottom: 41,
    },
    content: {
      flex: 1,
      width: "100%",
      alignItems: "flex-start",
      padding: 41,
      justifyContent: "center",
    },
    buttonWrap: {
      width: "100%",
      padding: 20,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },
    bar: {
      flex: 1,
      height: 1,
      backgroundColor: Colors[colorScheme].borderColor.primary,
      marginTop: 15,
    },
    item: {
      backgroundColor: "transparent",
    },
    label: {
      textAlign: "center",
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 17,
    },
    textAreaContainer: {
      width: "100%",
      borderColor: Colors[colorScheme].borderColor.primary,
      borderWidth: 1,
      padding: 5,
      marginBottom: 82,
    },
    textArea: {
      color: Colors[colorScheme].text.primary,
      fontSize: 18,
    },
  });
