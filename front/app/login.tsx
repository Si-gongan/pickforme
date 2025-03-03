import { View } from "react-native";

import { LoginForm, BackHeader } from "@components";

export default function LoginScreen() {
  return (
    <View>
      <BackHeader />
      <LoginForm />
    </View>
  );
}
