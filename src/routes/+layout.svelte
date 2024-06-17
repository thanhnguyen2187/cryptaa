<script lang="ts">
import { pwaInfo } from "virtual:pwa-info";
import { registerSW } from "virtual:pwa-register";
import { onMount } from "svelte";

onMount(async () => {
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
});
$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : "";
</script>

<svelte:head>
	{#if import.meta.env.DEV }
		<title>Cryptaa - Development</title>
	{/if}
	{@html webManifestLink}
</svelte:head>

<slot />

