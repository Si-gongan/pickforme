import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View as RNView } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Text, View } from '@components';
import { Colors } from '@constants';
import useColorScheme from '../../hooks/useColorScheme';
import { focusOnRef } from '@/utils/accessibility';
import { getRequestsAtom } from '@/stores/request/atoms';
import { useSetAtom } from 'jotai';
import { formatDate, formatTime } from '../../utils/common';

interface ManagerAnswerSectionProps {
    productRequests: any[];
    loadingMessages: any;
}

const ManagerAnswerSection: React.FC<ManagerAnswerSectionProps> = ({ productRequests, loadingMessages }) => {
    const colorScheme = useColorScheme();
    const styles = useStyles(colorScheme);
    const getRequests = useSetAtom(getRequestsAtom);

    const markdownStyles = StyleSheet.create({
        text: {
            fontSize: 14,
            lineHeight: 20,
            color: Colors[colorScheme].text.primary
        }
    });

    useEffect(() => {
        getRequests();
    }, []);

    if (!productRequests || productRequests.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.seperator} />
            <View accessible={true} accessibilityLabel="매니저 답변">
                <Text style={styles.boldText}>매니저 답변</Text>
            </View>
            <View style={styles.seperator} />

            {productRequests.map((req, index) => (
                <View key={req._id || index} style={index > 0 ? { marginTop: 20 } : {}}>
                    <Text
                        style={{ color: Colors[colorScheme].text.primary, marginBottom: 5 }}
                        accessible={true}
                        accessibilityLabel={`질문 날짜: ${formatDate(req?.updatedAt)} ${formatTime(req?.updatedAt)}`}
                    >
                        {`${formatDate(req?.updatedAt)} ${formatTime(req?.updatedAt)}`}
                    </Text>

                    <View accessible={true} accessibilityLabel={`나의 질문: ${req?.text || ''}`}>
                        <Markdown style={markdownStyles}>{`**나의 질문:** ${req?.text || ''}`}</Markdown>
                    </View>

                    {req.answer?.text ? (
                        <View accessible={true} accessibilityLabel={`픽포미 매니저 답변: ${req?.answer?.text || ''}`}>
                            <Markdown style={markdownStyles}>{`**픽포미 매니저:** ${
                                req?.answer?.text || ''
                            }`}</Markdown>
                        </View>
                    ) : (
                        <View accessible={true} accessibilityLabel={loadingMessages.manager}>
                            <Text style={styles.loadingMessageText}>{loadingMessages.manager}</Text>
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
};

const useStyles = (colorScheme: 'light' | 'dark') =>
    StyleSheet.create({
        container: {
            marginTop: 20
        },
        seperator: {
            width: '100%',
            backgroundColor: Colors[colorScheme].border.primary,
            height: 1,
            marginVertical: 25
        },
        boldText: {
            fontWeight: '700',
            color: Colors[colorScheme].text.primary
        },
        loadingMessageText: {
            fontSize: 14,
            color: Colors[colorScheme].text.secondary
        }
    });

export default ManagerAnswerSection;
