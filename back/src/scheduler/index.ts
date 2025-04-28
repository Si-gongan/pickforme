import { registerMembershipScheduler } from './membership';
import { registerIAPScheduler } from './iap';
import { registerEventScheduler } from './events';  

export function registerAllSchedulers() {
  registerMembershipScheduler();
  registerIAPScheduler();
  registerEventScheduler();
}

export default registerAllSchedulers;
