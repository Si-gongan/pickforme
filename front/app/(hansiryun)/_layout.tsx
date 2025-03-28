import { Stack } from 'expo-router';
import { useAtomValue } from 'jotai';
import { settingAtom } from '@stores';

export default function HansiRyuLayout() {
    const setting = useAtomValue(settingAtom);

    return (
        <Stack initialRouteName="index">
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
    );
}
