<script lang="ts">
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { InputChip } from "@skeletonlabs/skeleton";
import { Fa } from "svelte-fa";
import type { NoteDisplay } from "../data/schema-triplit";
import { formatDate } from '$lib/date';

// Use this to "receive" Skeleton's prop passing to this component. In case we
// don't, a harmless warning would be raised.
export let parent: unknown;
export let note: NoteDisplay;
export let fnSubmit: () => void;
export let fnCancel: () => void;
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
      <span>Title</span>
      <input
        class="input"
        spellcheck="false"
        bind:value={note.title}
        disabled={note.encrypted}
      />
    </label>
    <label class="label">
      <span>Text</span>
      <textarea
        class="textarea"
        rows="8"
        spellcheck="false"
        bind:value={note.text}
        disabled={note.encrypted}
      ></textarea>
    </label>
    <label>
      <span>Tags</span>
      <InputChip
        name="tags"
        bind:value={note.tags}
        disabled={note.encrypted}
      />
    </label>
    <label class="label">
      <span>ID</span>
      <input
        class="input"
        value={note.id}
        disabled
      />
    </label>
    <label class="label">
      <span>Date created</span>
      <input
        value={formatDate(note.createdAt)}
        class="input"
        disabled
      />
    </label>
    <label class="label">
      <span>Last updated</span>
      <input
        value={formatDate(note.updatedAt)}
        class="input"
        disabled
      />
    </label>
  </section>
  <footer class="card-footer flex flex-row-reverse">
    <button
      class="btn variant-filled"
      on:click={fnSubmit}
      disabled={note.encrypted}
    >
      Save
    </button>
  </footer>
</div>
