import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet from 'react-native-modal';
import { useAtom } from 'jotai';

import { isShowLoginModalAtom } from '@stores';
import { Props, styles } from './Base';
import LoginForm from '../LoginForm';

const localStyles = StyleSheet.create({
    bottomSheet: {
        flex: 0,
        paddingHorizontal: 20
    }
});

const LoginBottomSheet: React.FC<Props> = () => {
    const router = useRouter();

    const [visible, setVisible] = useAtom(isShowLoginModalAtom);

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
