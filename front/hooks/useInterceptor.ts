import { useEffect } from 'react';
import client from '../utils/axios';
import { useSetAtom } from 'jotai';
import { isShowLoginModalAtom, userDataAtom } from '../stores/auth/atoms';

const useInterceptor = () => {
  const setUserData = useSetAtom(userDataAtom);
  const setIsShowLoginModalAtom = useSetAtom(isShowLoginModalAtom);
  useEffect(() => {
    const clientInterceptor = client.interceptors.response.use(
      async (response) => response,
      async (error) => {
        // if (error.response && error.response.status === 401 && !error.config.isRetryRequest) {
        if (error.response && error.response.status === 401) {
          console.log(error.response.message);
          /*
          const promise = new ControlledPromise<void>();
          addRetryPromise({ promise, preventReLogin });
          getAccessToken();
          return retry(promise, client, error.config);
          */
          setUserData(undefined);
          setIsShowLoginModalAtom(true);
        }
        return Promise.reject(error);
      },
    );
    return () => {
      client.interceptors.response.eject(clientInterceptor);
    };
  }, []);

      /*
       * refresh 구현이후 사용
  useEffect(() => {
    if (Token?.refreshToken) {
      if (checkExpire(jwtDecode<Token>(Token.refreshToken).exp)) {
        removeToken();
      } else if (checkExpire(jwtDecode<Token>(Token.accessToken).exp)) {
        getAccessToken();
      }
      setPreventReLogin(false);
    }
  }, [Token, getAccessToken, removeToken]);
      */

  return null;
};

export default useInterceptor;
