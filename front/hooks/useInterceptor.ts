import { useEffect } from 'react';
import client from '../utils/axios';
import { useSetAtom } from 'jotai';
import { isShowLoginModalAtom, userDataAtom } from '../stores/auth/atoms';

const useInterceptor = () => {
  const setUserData = useSetAtom(userDataAtom);
  const setIsShowLoginModal = useSetAtom(isShowLoginModalAtom);
  useEffect(() => {
    const clientInterceptor = client.interceptors.response.use(
      async (response) => response,
      async (error) => {
        // if (error.response && error.response.status === 401 && !error.config.isRetryRequest) {
        if (error.response) {
          if (error.response.status === 401) {
            console.log(error.response.message);
            /*
            const promise = new ControlledPromise<void>();
            addRetryPromise({ promise, preventReLogin });
            getAccessToken();
            return retry(promise, client, error.config);
            */
            setUserData(undefined);
            setIsShowLoginModal(true);
          } else {
            // 다른 에러 처리
            console.log(error.response.data);
          }
        } else {
          console.error("응답이 없습니다. 네트워크 오류일 수 있습니다.");
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
