import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet from 'react-native-modal';
import { useAtom } from 'jotai';

import { isShowLoginModalAtom } from '@stores';
import { Props, styles } from './Base';
import LoginForm from '../LoginForm';
import useColorScheme from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';

const LoginBottomSheet: React.FC<Props> = () => {
    const router = useRouter();
    const colorScheme = useColorScheme();

    const [visible, setVisible] = useAtom(isShowLoginModalAtom);

    const localStyles = StyleSheet.create({
        bottomSheet: {
            flex: 0,
            paddingHorizontal: 20,
            backgroundColor: Colors[colorScheme].background.primary
        }
    });

    const onClose = () => setVisible(false);

    return (
        <BottomSheet style={styles.base} isVisible={visible} onBackButtonPress={onClose} onBackdropPress={onClose}>
            <View style={[styles.bottomSheet, localStyles.bottomSheet]}>
                <LoginForm />
            </View>
        </BottomSheet>
    );
};
export default LoginBottomSheet;
