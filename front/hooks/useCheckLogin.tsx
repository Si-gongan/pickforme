import { useAtomValue, useSetAtom } from "jotai";

import { userDataAtom, isShowLoginModalAtom } from "@stores";

const useCheckLogin = (callback: (e: any) => any) => {
  const isLogin = !!useAtomValue(userDataAtom);
  const setIsShowLoginModal = useSetAtom(isShowLoginModalAtom);
  if (isLogin) {
    return callback;
  }
  return () => {
    setIsShowLoginModal(true);
  };
};

export default useCheckLogin;
