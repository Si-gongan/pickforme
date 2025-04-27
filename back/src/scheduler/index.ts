import { registerMembershipScheduler } from './membership';
import { registerIAPScheduler } from './iap';
export function registerAllSchedulers() {
  registerMembershipScheduler();
  registerIAPScheduler();
}

export default registerAllSchedulers;
