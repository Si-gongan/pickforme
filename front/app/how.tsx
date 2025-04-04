import { View } from 'react-native';

import { BackHeader } from '@components';
import How from '../components/BottomSheet/How';

export default function HowScreen() {
    return (
        <View>
            <BackHeader />
            <How isHomeButton={false} />
        </View>
    );
}
