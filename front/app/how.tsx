import { View, StyleSheet } from 'react-native';

import { BackHeader } from '@components';
import How from '../components/BottomSheet/How';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';

export default function HowScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme];
    
    return (
        <View style={{ flex: 1, backgroundColor: theme.background.primary }}>
            <BackHeader />
            <How isHomeButton={false} />
        </View>
    );
}
