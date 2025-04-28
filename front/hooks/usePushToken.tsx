import React from 'react';
import { Platform } from 'react-native';
import { useSetAtom, useAtomValue } from 'jotai';
import { useRouter } from 'expo-router';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { setPushTokenAtom, userAtom } from '@stores';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true
    })
});

const usePushToken = () => {
    const userData = useAtomValue(userAtom);
    const setPushToken = useSetAtom(setPushTokenAtom);
    const router = useRouter();

    React.useEffect(() => {
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            // notification 받은경우
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            // notification 누른경우
            const data = response.notification.request.content.data;
            if (data.url) {
                router.push(data.url);
            }
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener);
            Notifications.removeNotificationSubscription(responseListener);
        };
    }, [router]);

    React.useEffect(() => {
        if (userData?._id) {
            registerForPushNotifications()
                .then(token => {
                    if (token) {
                        setPushToken({ token });
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }, [userData?._id]);

    return null;
};

async function registerForPushNotifications() {
    let token;

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
            console.log('existingStatus', existingStatus);
        }

        if (finalStatus !== 'granted') {
            console.log('finalStatus', finalStatus);
            return;
        }

        token = (
            await Notifications.getExpoPushTokenAsync({
                projectId: 'e1838378-658e-46ee-b890-0e439a47e799'
            })
        ).data;
    } else {
        // alert("Must use physical device for Push Notifications");
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            showBadge: true,
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FE9018'
        });
    }

    return token;
}

export default usePushToken;
