import {
  Expo, ExpoPushMessage,
} from 'expo-server-sdk';

const expo = new Expo();

const sendPush = (message: ExpoPushMessage) => {
  if (!message.to || !Expo.isExpoPushToken(message.to)) {
    return;
  }
  const chunks = expo.chunkPushNotifications([{
    sound: 'default',
    ...message,
  }]);
  (async () => {
    // eslint-disable-next-line no-restricted-syntax
    for (const chunk of chunks) {
      expo.sendPushNotificationsAsync(chunk).catch(() => {});
    }
  })();
};
export default sendPush;
