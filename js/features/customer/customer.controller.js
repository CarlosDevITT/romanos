import { customerService } from './customer.service.js';

export function getCurrentCustomer() {
  return customerService.getCurrent();
}
