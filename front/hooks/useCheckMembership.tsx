import { useAtomValue, useSetAtom } from 'jotai';
import { isShowNoMembershipModalAtom } from '../stores/auth/atoms';
import { subscriptionAtom, getSubscriptionAtom } from '../stores/purchase/atoms';

const useCheckMembership = (callback: (e?: any) => any) => {
  const setIsShowNoMembershipModal = useSetAtom(isShowNoMembershipModalAtom);
  const subscription = useAtomValue(subscriptionAtom);
  const getSubscription = useSetAtom(getSubscriptionAtom);

  return (params: any) => {
    getSubscription();
    if (!subscription) {
      callback(params);
    } else {
      setIsShowNoMembershipModal(true);
    }
  }
}

export default useCheckMembership;
