import { Stack } from 'expo-router';
import { useAtomValue } from 'jotai';
import { settingAtom } from '@stores';

export default function OnBoardingLayout() {
    const setting = useAtomValue(settingAtom);

    return (
        <Stack initialRouteName="index">
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="nickname" options={{ headerShown: false }} />
        </Stack>
    );
}
