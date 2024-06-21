import type { ToastStore } from '@skeletonlabs/skeleton';

export type ToastManager = {
  warn(message: string): void;
  success(message: string): void;
  error(message: string): void;
};

export function createToastManagerDummy(): ToastManager {
  return {
    warn(message: string) {},
    success(message: string) {},
    error(message: string) {},
  }
}

export function createToastManagerSkeleton(toastStore: ToastStore): ToastManager {
  return {
    warn(message: string) {
      toastStore.trigger({
        message,
        hideDismiss: true,
        background: "bg-warning-800",
        timeout: 2500,
      });
    },
    success(message: string) {
      toastStore.trigger({
        message,
        hideDismiss: true,
        background: "bg-success-800",
        timeout: 2500,
      });
    },
    error(message: string) {
      toastStore.trigger({
        message,
        hideDismiss: true,
        background: "bg-error-700",
        timeout: 2500,
      });
    },
  }
}
