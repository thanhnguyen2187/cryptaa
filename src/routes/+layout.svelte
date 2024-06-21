<script lang="ts">
import { pwaInfo } from "virtual:pwa-info";

$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : "";
</script>

<svelte:head>
	{#if import.meta.env.DEV }
		<title>Cryptaa - Development</title>
	{/if}
	{@html webManifestLink}
</svelte:head>

<slot />

