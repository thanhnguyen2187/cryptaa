<script lang="ts">
import "../../app.postcss";
import {
  AppShell,
  AppBar,
  storePopup,
  initializeStores,
  Toast,
  Modal,
  getToastStore,
  getModalStore,
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
import { createToastManagerSkeleton } from "$lib/toast-manager";
import { createModalManagerSkeleton } from "$lib/modal-manager";

// Floating UI for Popups
initializeStores();
storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

const globalToastStore = getToastStore();
const globalModalStore = getModalStore();
const globalToastManager = createToastManagerSkeleton(globalToastStore);
globalAppActor.send({ type: "SetToastManager", value: globalToastManager });
globalAppActor.send({ type: "SetModalStore", value: globalModalStore });

const tagsArray = useSelector(globalAppActor, (snapshot) =>
  Array.from(snapshot.context.tags),
);

function deleteTag(tag: string) {
  globalAppActor.send({ type: "TagDelete", tag });
}

function setKeyword(keyword: string) {
}

function handleKeywordChange(e: Event) {
  const keyword = (e.target as HTMLInputElement).value;
  globalAppActor.send({ type: "SetKeyword", value: keyword });
}
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
        class="input-group input-group-divider"
        class:grid-cols-[auto_1fr]={$tagsArray.length === 0}
        class:grid-cols-[auto_1fr_auto]={$tagsArray.length > 0}
      >
        <div class="input-group-shim">
          <Fa icon={faSearch} />
        </div>
        <input
          type="text"
          placeholder="Search..."
          on:change={handleKeywordChange}
        />
        <div
          class="flex gap-1"
        >
          {#each $tagsArray as tag}
            <button
              class="chip variant-ghost-secondary"
              on:click={() => deleteTag(tag)}
            >
              {tag}
            </button>
          {/each}
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
