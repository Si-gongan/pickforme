import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

const sendPush = (message: ExpoPushMessage) => {
  if (!message.to || !Expo.isExpoPushToken(message.to)) {
    return;
  }
  const chunks = expo.chunkPushNotifications([
    {
      sound: 'default',
      ...message,
    },
  ]);
  (async () => {
    // eslint-disable-next-line no-restricted-syntax
    for (const chunk of chunks) {
      expo.sendPushNotificationsAsync(chunk).catch(() => {});
    }
  })();
};

export const sendPushs = (tos: string[], message: Omit<ExpoPushMessage, 'to'>) => {
  if (tos.some((to) => !to || !Expo.isExpoPushToken(to))) {
    return;
  }
  const chunks = expo.chunkPushNotifications(
    tos.map((to) => ({
      sound: 'default',
      ...message,
      to,
    }))
  );
  (async () => {
    // eslint-disable-next-line no-restricted-syntax
    for (const chunk of chunks) {
      expo.sendPushNotificationsAsync(chunk).catch(() => {});
    }
  })();
};

export default sendPush;
