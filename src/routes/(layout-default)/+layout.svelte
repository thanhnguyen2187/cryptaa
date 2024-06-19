<script lang="ts">
import "../../app.postcss";
import {
  AppShell,
  AppBar,
  storePopup,
  initializeStores,
  Toast,
  Modal, getToastStore, getModalStore,
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
import { globalAppActor, globalClient } from "$lib/global";
import { useSelector } from "@xstate/svelte";
import { noteCount, notesRead } from "../../data/queries-triplit";
import { derived } from "svelte/store";
import { createToastManagerSkeleton } from '$lib/toast-manager';
import { createModalManagerSkeleton } from '$lib/modal-manager';

// Floating UI for Popups
initializeStores();
storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

const globalToastStore = getToastStore();
const globalModalStore = getModalStore();
const globalToastManager = createToastManagerSkeleton(globalToastStore)
const globalModalManager = createModalManagerSkeleton(globalModalStore, () => {
  globalAppActor.send({type: "ModalClosed"})
})
globalAppActor.send({type: "SetToastManager", value: globalToastManager})
globalAppActor.send({type: "SetModalStore", value: globalModalStore})
</script>

<Toast/>
<Modal/>
<!-- App Shell -->
<AppShell>
  <svelte:fragment slot="header">
    <!-- App Bar -->
    <AppBar slotDefault="place-self-center">
      <svelte:fragment slot="lead">
        <strong class="hidden md:block text-xl uppercase">Cryptaa</strong>
      </svelte:fragment>
      <div
        class="input-group input-group-divider grid-cols-[auto_1fr]"
      >
        <div class="input-group-shim">
          <Fa icon={faSearch} />
        </div>
        <input
          type="text"
          placeholder="Search..."
        />
        <div
          class="flex gap-1"
        >
        </div>
      </div>
      <svelte:fragment slot="trail">
        <strong class="text-xl uppercase invisible">Crypta</strong>
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>
  <!-- Page Route Content -->
  <slot />
</AppShell>
