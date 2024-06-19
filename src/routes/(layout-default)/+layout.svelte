<script lang="ts">
  import "../../app.postcss";
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
  import { globalActorApp, globalClient } from "$lib/global";
  import { useSelector } from "@xstate/svelte";
  import { noteCount, notesRead } from "../../data/queries-triplit";
  import { derived } from "svelte/store";

  // Floating UI for Popups
  initializeStores();
  storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
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
