import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack initialRouteName="nickname">
      <Stack.Screen name="nickname" options={{ headerShown: false }} />
    </Stack>
  );
}
