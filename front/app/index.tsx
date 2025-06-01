import { userAtom } from '@/stores';
import { Redirect, useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { View } from 'react-native';

export default function Index() {

    const user = useAtomValue(userAtom);
    const redirect_path = user && user.token && user.token.length > 0 ? '/(tabs)' : '/(onboarding)';

    // 초기화시에는 어떻게 되어있나? 
    // 1. 로그인 안되어있으면 -> 설정 확인후에 tabs or onboarding.
    // 2. 로그인 되어있으면 -> 한시련 팝업확인후에 tabs or hansiryun.

    return <Redirect href={redirect_path} />;

    // return <View />;
}
