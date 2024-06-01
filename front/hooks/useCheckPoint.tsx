import { useAtomValue, useSetAtom } from 'jotai';
import { userDataAtom, isShowLackModalAtom } from '../stores/auth/atoms';

const useCheckPoint = (point: number, callback: (e?: any) => any) => {
  const userData = useAtomValue(userDataAtom);
  const setIsShowLackModal = useSetAtom(isShowLackModalAtom);
  const isLack = !userData || userData.point < point;
  if (!isLack) {
    return callback;
  }
  return () => {
    setIsShowLackModal(true);
  }
}

export default useCheckPoint;
