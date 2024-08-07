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
export let fnSave: () => void;
export let fnEncryptAndSave: () => void;
export let fnCancel: () => void;

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    fnSave();
  }
}
</script>

<div class="card w-modal relative">
  <button
    class="badge-icon variant-ghost-secondary absolute top-3 right-3"
    on:click={fnCancel}
  >
    <Fa icon={faClose} />
  </button>
  <section class="p-4 flex flex-col gap-4">
    <label class="label">
      <span>Title</span>
      <input
        class="input"
        spellcheck="false"
        bind:value={note.title}
        on:keydown={handleKeyDown}
        disabled={note.encryptionState === "encrypted"}
      />
    </label>
    <label class="label">
      <span>Text</span>
      <textarea
        class="textarea"
        rows="8"
        spellcheck="false"
        bind:value={note.text}
        disabled={note.encryptionState === "encrypted"}
      ></textarea>
    </label>
    <label>
      <span>Tags</span>
      <InputChip
        name="tags"
        bind:value={note.tags}
        disabled={note.encryptionState === "encrypted"}
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
  <footer class="card-footer flex flex-row-reverse gap-2">
    <button
      class="btn variant-filled"
      on:click={fnSave}
      disabled={note.encryptionState === "encrypted"}
    >
      Save
    </button>
    <button
      class="btn variant-soft-secondary"
      on:click={fnEncryptAndSave}
      disabled={note.encryptionState === "encrypted"}
    >
      Encrypt & Save
    </button>
  </footer>
</div>
