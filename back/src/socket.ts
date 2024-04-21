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
          now <= new Date('2024-05-19T15:00:00.000Z')
        ) {
          const attended = await db.Event.findOne({
            eventId: '2024_0420', userId: user._id,
          });
          if (!attended) {
            await db.Event.create({
              userId: user._id, eventId: '2024_0420',
            });
            const userDocument = await db.User.findById(user._id);
            if (userDocument) {
              const count = await db.Event.count({});
              await userDocument.save();
              socket.emit('bottomsheet', [{
                type: 'title',
                text: '언더웨어 브랜트 "더잠" 입점',
              }, {
                type: 'desc',
                text: '4월 20일부터 한 달간 언더웨어 브랜드가 픽포미에 입점하게 되었습니다. 탐색탭 페이지에서 점자 팬티를 포함한 더잠의 상품들과 단독 할인 프로모션을 지금 바로 만나보세요.',
              }]);
            }
          }
        }

        socket.on('disconnect', async () => {
          await db.Session.findOneAndDelete({
            connectionId: socket.id, userId: user._id,
          });
        });
      } catch (e) {
        // discard error
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
