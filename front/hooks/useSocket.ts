import io from 'socket.io-client';
import React from 'react';
import { API_HOST } from '../utils/axios';
import { userDataAtom } from '../stores/auth/atoms';
import { useAtomValue } from 'jotai';

const useSocket = () => {
  const userData = useAtomValue(userDataAtom);
  const token = React.useMemo(() => userData?.token, [userData]);

  React.useEffect(() => {
    if (token) {
      const ws = io(API_HOST, { extraHeaders: { token } });
      ws.on('message', e => {
        console.log(e);
      });
      return () => {
        ws.disconnect();
      }
    }
  }, [token]);
}

export default useSocket;
