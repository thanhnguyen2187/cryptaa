<script lang="ts">
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { InputChip } from "@skeletonlabs/skeleton";
import { Fa } from "svelte-fa";
import type { NoteDisplay } from "../data/schema-triplit";
import { formatDate } from '$lib/date';

// Use this to "receive" Skeleton's prop passing to this component. In case we
// don't, a harmless warning would be raised.
export let parent: unknown;
export let showWarning = true;
export let fnSubmit: (password: string) => void;
export let fnCancel: () => void;

let password = "";
</script>

<div class="card w-modal relative">
  <button
    class="badge-icon variant-ghost-secondary absolute top-3 right-3"
    on:click={fnCancel}
  >
    <Fa icon={faClose} />
  </button>
  <section class="p-4 flex flex-col gap-2">
    <label class="label">
      <span>Password</span>
      <input
        class="input"
        spellcheck="false"
        type="password"
        bind:value={password}
      />
    </label>
    {#if showWarning}
      <div>
        Please beware that once the data is encrypted, the only way to decrypt it
        is to use the same password!
      </div>
    {/if}
  </section>
  <footer class="card-footer flex flex-row-reverse">
    <button
      class="btn variant-filled"
      on:click={() => fnSubmit(password)}
    >
      Submit
    </button>
  </footer>
</div>
