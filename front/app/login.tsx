import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import useColorScheme from "../hooks/useColorScheme";
import Colors from "../constants/Colors";

import { LoginForm, BackHeader } from "@components";
import { userAtom } from "@stores";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const style = useStyle(colorScheme);

  const user = useAtomValue(userAtom);
  const router = useRouter();

  useEffect(
    function () {
      if (user?._id && router.canGoBack()) {
        router.back();
      }
    },
    [user?._id, router]
  );

  return (
    <View style={style.LoginScreenContainer}>
      <BackHeader />
      <View style={style.LoginScreenContent}>
        <LoginForm />
      </View>
    </View>
  );
}

function useStyle(colorScheme: ReturnType<typeof useColorScheme>) {
  const theme = Colors[colorScheme];
  return StyleSheet.create({
    LoginScreenContainer: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    LoginScreenContent: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 80,
    },
  });
}
