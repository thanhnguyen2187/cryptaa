<script lang="ts">
import "../../../app.postcss";
import {
  AppShell,
  storePopup,
  initializeStores,
  Toast,
} from "@skeletonlabs/skeleton";
import {
  computePosition,
  autoUpdate,
  flip,
  shift,
  offset,
  arrow,
} from "@floating-ui/dom";

// Floating UI for Popups
initializeStores();
storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<Toast/>
<AppShell>
	<slot />
</AppShell>

