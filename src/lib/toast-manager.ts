import type { ToastStore } from '@skeletonlabs/skeleton';

export type Toast = {
  warn(message: string): void;
  success(message: string): void;
  error(message: string): void;
};

export function createToastDummy(): Toast {
  return {
    warn(message: string) {},
    success(message: string) {},
    error(message: string) {},
  }
}

export function createToastSkeleton(toastStore: ToastStore): Toast {
  return {
    warn(message: string) {
      toastStore.trigger({
        message,
        hideDismiss: true,
        background: "bg-warning-800",
      });
    },
    success(message: string) {
      toastStore.trigger({
        message,
        hideDismiss: true,
        background: "bg-success-800",
      });
    },
    error(message: string) {
      toastStore.trigger({
        message,
        hideDismiss: true,
        background: "bg-error-700",
      });
    },
  }
}
