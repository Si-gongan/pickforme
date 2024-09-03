import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
import { StyleSheet, Pressable, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
import Colors from '../constants/Colors';
import Button from '../components/Button';
import { Text, View } from '../components/Themed';
import { useAtomValue, useSetAtom } from 'jotai';
import { userDataAtom } from '../stores/auth/atoms';
import { subscriptionAtom, getSubscriptionAtom, subscriptionListAtom, getSubscriptionListAtom, purchaseListAtom, getPurchaseListAtom } from '../stores/purchase/atoms';
import { formatTime, formatDate, formatDateAfterOneMonth } from '../utils/common';
import Autolink from "react-native-autolink";

export default function PointHistoryScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const currentSubscription = useAtomValue(subscriptionAtom);
    const subscriptions = useAtomValue(subscriptionListAtom);
    const purchases = useAtomValue(purchaseListAtom);
    const userData = useAtomValue(userDataAtom);
    const styles = useStyles(colorScheme);

    const getCurrentSubscription = useSetAtom(getSubscriptionAtom);
    const getSubscriptionList = useSetAtom(getSubscriptionListAtom);

    const getPurchaseList = useSetAtom(getPurchaseListAtom);

    useEffect(() => {
        getCurrentSubscription();
        getSubscriptionList();
    }, [getCurrentSubscription, getSubscriptionList]);

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.content}>
                    {currentSubscription ? (
                        <>
                            <Text style={styles.title}>
                                픽포미 플러스 정기 구독 중
                            </Text>
                            <View style={styles.purchaseStatus}>
                                <View style={styles.row}>
                                    <Text>구독 기간</Text>
                                    <Text>{formatDate(currentSubscription.createdAt)} ~ {formatDateAfterOneMonth(currentSubscription.createdAt)}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text>다음 결제일</Text>
                                    <Text>{formatDateAfterOneMonth(currentSubscription.createdAt)}</Text>
                                </View>
                            </View>

                            <Button
                                style={styles.purchaseButton}
                                title="멤버십 해지하기"
                                size='small'
                                onPress={() => router.replace('/')}
                            />
                        </>
                    ) : (
                        <>
                            <Text style={styles.title}>
                                구독 중인 멤버십 없음
                            </Text>
                            <Button
                                style={styles.purchaseButton}
                                title="멤버십 구매하기"
                                size='small'
                                onPress={() => router.replace('/membership')}
                            />
                        </>
                    )}
                    <View style={styles.seperator}></View>
                    <Text style={styles.title}>
                        멤버십 구매 내역
                    </Text>
                    {
                        subscriptions && subscriptions.length > 0 ?
                            subscriptions?.map((subscription, index) => (
                                <View key={index} style={styles.purchaseWrap}>
                                    <Text style={styles.purchaseDate}>
                                        {formatDate(subscription.createdAt)} 결제
                                    </Text>
                                    <View style={styles.row}>
                                        <Text style={styles.purchaseTitle}>
                                            {subscription.product.displayName} 월간 이용권
                                        </Text>
                                        <Text style={styles.purchasePrice}>
                                            {subscription.purchase.isTrial ? '무료' : '4,900원'}
                                        </Text>
                                    </View>
                                </View>
                            )) : (
                                <Text>구매 내역이 없습니다.</Text>
                            )}
                </View>
            </ScrollView>
        </View>
    );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 31,
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontWeight: '600',
        fontSize: 20,
        lineHeight: 24,
        marginBottom: 18
    },
    subtitle: {
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 17,
        marginBottom: 14
    },
    seperator: {
        width: '100%',
        height: 0.5,
        backgroundColor: Colors[colorScheme].borderColor.primary,
        marginVertical: 20
    },
    purchaseStatus: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 10,
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors[colorScheme].borderColor.secondary,
        marginBottom: 12,
    },
    purchaseWrap: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors[colorScheme].borderColor.secondary,
        marginVertical: 8
    },
    purchaseTitle: {
        fontSize: 16,
        lineHeight: 19,
    },
    purchasePrice: {
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 19,
    },
    purchaseDate: {
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 17,
        marginBottom: 8
    },
    terms: {
        marginTop: 12,
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 15,
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 17,
        color: 'white'
    },
    purchaseButton: {
        width: 120,
        padding: 10,
        marginLeft: 'auto'
    },
});
