import { useAtomValue, useSetAtom } from 'jotai';
import { isShowNonSubscribedModalAtom } from '../stores/auth/atoms';
import { subscriptionAtom, getSubscriptionAtom } from '../stores/purchase/atoms';

const useCheckMembership = (callback: (e?: any) => any) => {
  const setIsShowNonSubscribedModal = useSetAtom(isShowNonSubscribedModalAtom);
  const subscription = useAtomValue(subscriptionAtom);
  const getSubscription = useSetAtom(getSubscriptionAtom);

  return (params: any) => {
    getSubscription();
    if (!subscription) {
      callback(params);
    } else {
      setIsShowNonSubscribedModal(true);
    }
  }
}

export default useCheckMembership;
