import io from 'socket.io-client';
import React from 'react';
import { API_HOST } from '@env';
import { userDataAtom, setPointAtom } from '../stores/auth/atoms';
import { receiveChatAtom } from '../stores/request/atoms';
import { useAtomValue, useSetAtom } from 'jotai';

const useSocket = () => {
  const userData = useAtomValue(userDataAtom);
  const setPoint = useSetAtom(setPointAtom);
  const receiveChat = useSetAtom(receiveChatAtom);
  const token = React.useMemo(() => userData?.token, [userData]);

  React.useEffect(() => {
    console.log('socket', API_HOST);
    if (token) {
      const ws = io(API_HOST, { extraHeaders: { token } });
      ws.on('message', e => {
        receiveChat(e);
      });
      ws.on('point', e => {
        setPoint(e);
      });
      return () => {
        ws.disconnect();
      }
    }
  }, [token, receiveChat, setPoint]);
}

export default useSocket;
