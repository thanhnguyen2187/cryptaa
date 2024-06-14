<script lang="ts">
import "../../../app.postcss";
import {
	AppShell,
	AppBar,
	storePopup,
	initializeStores,
	Toast,
	Modal,
} from "@skeletonlabs/skeleton";
import { Fa } from "svelte-fa";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
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
<slot />

