import { Stack } from "expo-router";
import { useAtomValue } from "jotai";
import { settingAtom } from "@stores";

export default function OnBoardingLayout() {
    const setting = useAtomValue(settingAtom);
    console.log("Setting state:", setting);
    console.log(
        "Initial route will be:",
        setting.isReady ? "(tabs)" : "(onboarding)"
    );

    return (
        <Stack initialRouteName="nickname">
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="nickname" options={{ headerShown: false }} />
        </Stack>
    );
}
