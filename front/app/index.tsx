import { Redirect, useRouter } from 'expo-router';
import { userAtom } from '@stores';
import { useAtomValue } from 'jotai';

export default function Index() {
    // 초기 라우트로 리다이렉트
    // tabs 폴더가 있으므로 탭 네비게이션으로 리다이렉트
    const router = useRouter();

    const user = useAtomValue(userAtom);
    const redirect_path = user && user.token && user.token.length > 0 ? '/(hansiryun)' : '/(onboarding)';

    return <Redirect href={redirect_path} />;
}
