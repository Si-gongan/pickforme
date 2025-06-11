import { useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useColorScheme from '../hooks/useColorScheme';
import type { ColorScheme } from '../hooks/useColorScheme';
import Colors from '../constants/Colors';

import { BackHeader, SelectButton } from '@components';
import { FAQS } from '@constants';

export default function FAQScreen() {
    const colorScheme = useColorScheme();
    const style = useStyle(colorScheme);
    const [tab, onTab] = useState<string>('AI');

    return (
        <View style={style.FAQScreenContainer}>
            <BackHeader />
            <View style={style.FAQContent}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={style.FAQScroll}>
                    <Text style={style.FAQTitle}>자주 묻는 질문</Text>

                    <SelectButton
                        value={tab}
                        items={Object.entries(FAQS).map(function ([key, { name }]) {
                            return { name, value: key as string };
                        })}
                        onChange={onTab}
                    />

                    <View style={style.FAQRows}>
                        {FAQS[tab].questions.map(function ({ question, answer }, index) {
                            return (
                                <View style={style.FAQItem} key={`faq-row-${index}`}>
                                    <Text style={style.FAQQuestion}>{question}</Text>
                                    <Text style={style.FAQAnswer}>{answer}</Text>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

function useStyle(colorScheme: ColorScheme) {
    const insets = useSafeAreaInsets();
    const theme = Colors[colorScheme];

    return StyleSheet.create({
        FAQScreenContainer: {
            flex: 1,
            backgroundColor: theme.background.primary
        },
        FAQContent: {
            flex: 1,
            paddingHorizontal: 20
        },
        FAQScroll: {
            paddingTop: 24,
            paddingBottom: insets.bottom + 24
        },
        FAQTitle: {
            fontWeight: '600',
            fontSize: 22,
            lineHeight: 34,
            marginBottom: 36,
            color: theme.text.primary
        },
        FAQRows: {
            marginTop: 24,
            color: theme.text.primary
        },
        FAQItem: {
            flexDirection: 'column',
            paddingVertical: 24,
            flex: 1,
            gap: 8
        },
        FAQQuestion: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.text.primary
        },
        FAQAnswer: {
            fontSize: 12,
            lineHeight: 30,
            fontWeight: '500',
            color: theme.text.primary
        }
    });
}
