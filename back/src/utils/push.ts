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
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
      }
    }
  })();
};
export default sendPush;
