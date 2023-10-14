import http from 'http';
import socketio from 'socket.io';
import db from './models';
import {
  decodeJWT,
} from './utils/jwt';

db.Session.deleteMany({});

class Socket {
  private io: socketio.Server | void = undefined;

  setServer(server: ReturnType<typeof http.createServer>) {
    this.io = new socketio.Server(server);
    this.io.on('connection', async (socket) => {
      const {
        token,
      } = socket.handshake.headers;
      if (!token || typeof token !== 'string') {
        socket.disconnect();
        return;
      }
      try {
        const user = decodeJWT(token);
        await db.Session.deleteMany({
          userId: user._id,
        });
        await db.Session.create({
          connectionId: socket.id, userId: user._id,
        });
        // 2023 흰지팡이 event 대응
        const now = new Date();
        if (
          now >= new Date('2023-10-14T15:00:00.000Z')
            && now <= new Date('2023-10-20T15:00:00.000Z')
        ) {
          const attended = await db.Event.findOne({
            eventId: '2023_1015', userId: user._id,
          });
          if (!attended) {
            await db.Event.create({
              userId: user._id, eventId: '2023_1015',
            });
            const userDocument = await db.User.findById(user._id);
            if (userDocument) {
              const count = await db.Event.count({});
              const isFast = count < 44;
              userDocument.point += isFast ? 2 : 1;
              await userDocument.save();
              socket.emit('point', userDocument.point);
              socket.emit('bottomsheet', [{
                type: 'title',
                text: '제 44회 흰지팡이의 날을 축하해요!',
              }, {
                type: 'subtitle',
                text: '흰지팡이의 날을 기념해, 1픽을 무료로 드렸어요!',
              }, {
                type: 'desc',
                text: '픽포미는 앞으로도 시각장애인분들의 편리한 온라인 쇼핑을 위해 노력할게요!',
              }]);
              if (isFast) {
                socket.emit('bottomsheet', [{
                  type: 'title',
                  text: '선물이 도착했어요!',
                }, {
                  type: 'desc',
                  text: '제44회 흰지팡이의 날에, 선착순으로 픽포미에 접속하셨군요!',
                }, {
                  type: 'subtitle',
                  text: '지금 바로 사용하실 수 있는 1픽을 더 드렸어요!',
                }]);
              }
            }
          }
        }
        socket.on('disconnect', async () => {
          await db.Session.findOneAndDelete({
            connectionId: socket.id, userId: user._id,
          });
        });
      } catch (e) {
      }
    });
  }

  emit(socketId: string, channel: string, data: any) {
    if (!this.io) {
      return;
    }
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit(channel, data);
    }
  }
}

const instance = new Socket();

export default instance;
