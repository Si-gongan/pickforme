import { Stack } from "expo-router";
import { useAtomValue } from "jotai";
import { settingAtom } from "@stores";

export default function HansiRyuLayout() {
    const setting = useAtomValue(settingAtom);
    console.log("Setting state:", setting);
    console.log(
        "Initial route will be:",
        setting.isReady ? "(tabs)" : "(onboarding)"
    );

    return (
        <Stack initialRouteName="index">
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
    );
}
