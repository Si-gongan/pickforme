import { useCallback } from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { View } from '../Settings/Themed'; // Themed View 사용

import { BackImage } from '@assets';
import useStyle from './style';

interface BackHeaderProps {
    onPressBack?: () => void;
}

export default function BackHeader({ onPressBack }: BackHeaderProps) {
    const router = useRouter();
    const style = useStyle();

    const onPress = useCallback(
        function () {
            if (onPressBack) {
                onPressBack();
            } else if (router.canGoBack()) {
                router.back();
            }
        },
        [router, onPressBack]
    );

    return (
        <View style={style.BackHeader}>
            <TouchableOpacity
                style={style.BackHeaderButton}
                onPress={onPress}
                accessible
                accessibilityRole="button"
                accessibilityLabel="뒤로가기"
            >
                <Image style={style.BackHeaderImage} source={BackImage} />
            </TouchableOpacity>
        </View>
    );
}
