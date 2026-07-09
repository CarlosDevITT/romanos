import { showToast } from '../shared/components/toast.js';

export const notificationService = {
  success(message) {
    showToast(message, 'success');
  },
  error(message) {
    showToast(message, 'error');
  },
  info(message) {
    showToast(message, 'info');
  },
};
