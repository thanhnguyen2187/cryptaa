// @ts-nocheck
import { pwaInfo } from "virtual:pwa-info";
import { registerSW } from "virtual:pwa-register";

export const registerServiceWorker = async () => {
  if (pwaInfo) {
    const { registerSW } = await import("virtual:pwa-register");
    registerSW({
      immediate: true,
      onRegisteredSW(url: string) {
        console.log(`SW registered at: ${url}`);
      },
      onRegisterError(error: unknown) {
        console.error("SW registration error", error);
      },
    });
  }
};
