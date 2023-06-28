import io from 'socket.io-client';
import React from 'react';
import { API_HOST } from '@env';
import { userDataAtom } from '../stores/auth/atoms';
import { receiveChatAtom } from '../stores/request/atoms';
import { useSetAtom, useAtomValue } from 'jotai';

const useSocket = () => {
  const userData = useAtomValue(userDataAtom);
  const receiveChat = useSetAtom(receiveChatAtom);
  const token = React.useMemo(() => userData?.token, [userData]);

  React.useEffect(() => {
    if (token) {
      const ws = io(API_HOST, { extraHeaders: { token } });
      ws.on('message', e => {
        receiveChat(e);
      });
      return () => {
        ws.disconnect();
      }
    }
  }, [token, receiveChat]);
}

export default useSocket;
