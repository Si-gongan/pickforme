import { useAtomValue, useSetAtom } from 'jotai';

import { isShowLoginModalAtom } from '@stores';
import { userAtom } from '../stores/user';

const useCheckLogin = (callback: (e: any) => any) => {
    console.log('useCheckLogin 호출');
    const user = useAtomValue(userAtom);
    const setIsShowLoginModal = useSetAtom(isShowLoginModalAtom);
    if (user?.token) {
        console.log('로그인 상태, 콜백 호출');
        return callback;
    }
    console.log('로그인 상태 아님, 로그인 모달 표시');
    return () => {
        setIsShowLoginModal(true);
    };
};

export default useCheckLogin;
