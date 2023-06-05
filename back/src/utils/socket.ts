import db from 'models';
import {
  apiGateway,
} from '../websocket';

export const sendMessage = async (connectionId: string, message: any) => {
  try {
    const result = await apiGateway.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(message),
    }).promise();
    return result;
  } catch (e) {
    const session = db.Session.findOne({ 
      connectionId, 
    });
    if (session) {
      await session.remove();
    }
  }
};

export const broadcastMessage = async (senderId: string, message: any) => {
  const sessions = await db.Session.find({});
  const connectionIds = sessions
    .filter(({
      connectionId,
    }) => connectionId !== senderId)
    .map(({
      connectionId,
    }) => connectionId);

  await Promise.all(connectionIds.map((connectionId) => sendMessage(connectionId, message)));
};
