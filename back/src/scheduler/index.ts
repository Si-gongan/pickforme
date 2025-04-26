import { registerMembershipScheduler } from './membership';

export function registerAllSchedulers() {
  registerMembershipScheduler();
}

export default registerAllSchedulers;
