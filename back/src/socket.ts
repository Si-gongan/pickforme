import http from 'http';
import socketio from 'socket.io';
import db from './models';
import {
  decodeJWT,
} from './utils/jwt';

db.Session.deleteMany({});

class Socket {
  private io: socketio.Server | void = undefined;
  setServer(server: ReturnType<typeof http.createServer>){
    this.io = new socketio.Server(server);
    this.io.on("connection", async (socket) => {
    console.log('connection');
    const { token } = socket.handshake.headers;
    if (!token || typeof token !== 'string') {
      socket.disconnect();
      return;
    }
    const user = decodeJWT(token);
    await db.Session.deleteMany({
      userId: user._id,
    });
    const session = await db.Session.create({
      connectionId: socket.id, userId: user._id,
    });
    socket.on('disconnect', async () => {
      await db.Session.findOneAndDelete({
        connectionId: socket.id, userId: user._id,
      });
    });
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
