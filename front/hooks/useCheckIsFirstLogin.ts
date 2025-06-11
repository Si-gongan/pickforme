import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useCheckIsFirstLogin = () => {
    const [isFirstLogin, setIsFirstLogin] = useState(false);

    useEffect(() => {
        const checkFirstLogin = async () => {
            try {
                const hasLoggedIn = await AsyncStorage.getItem('hasLoggedIn');
                if (!hasLoggedIn) {
                    setIsFirstLogin(true);
                    await AsyncStorage.setItem('hasLoggedIn', 'true');
                } else {
                    setIsFirstLogin(false);
                }
            } catch (error) {
                console.error('최초 로그인 체크 에러:', error);
            }
        };

        checkFirstLogin();
    }, []);

    return {
        isFirstLogin
    };
};
