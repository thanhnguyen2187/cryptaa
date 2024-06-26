<script lang="ts">
import { formatDate } from "$lib/date";
import { globalClient, globalAppActor } from "$lib/global";
import {
  faCopy,
  faEdit,
  faKey,
  faLock,
  faTrashCan,
  faUnlock,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { getModalStore, getToastStore, popup } from "@skeletonlabs/skeleton";
import { useMachine, useSelector } from "@xstate/svelte";
import { Fa } from "svelte-fa";
import { aesGcmDecrypt } from "../data/encryption";
import type { NoteDisplay } from "../data/schema-triplit";
import ModalEncryption from "./ModalEncryption.svelte";
import { notesUpsert } from "../data/queries-triplit";
import { copyToClipboard } from "$lib/clipboard";

const toastStore = getToastStore();

export let note: NoteDisplay;
export let fnTagAdd: (tag: string) => void;

function decrypt_() {
  globalAppActor.send({ type: "Decrypt", note });
}

function encrypt() {
  globalAppActor.send({ type: "Encrypt", note });
}

async function copy() {
  const result = await copyToClipboard(note.text);
  if (result === "success") {
    toastStore.trigger({
      message: "Copied content to clipboard!",
      background: "bg-success-800",
      hideDismiss: true,
      timeout: 2000,
    });
  } else {
    toastStore.trigger({
      message: "Could not copy to clipboard!",
      background: "bg-error-700",
      hideDismiss: true,
      timeout: 2000,
    });
  }
}

function delete_() {
  globalAppActor.send({ type: "Delete", note });
}

function update() {
  globalAppActor.send({ type: "ModalOpenNote", note });
}

function clear() {
  if (note.encryptionState === "encrypted") {
    globalAppActor.send({ type: "Clear", note });
  }
}

function addTag(tag: string) {
  globalAppActor.send({ type: "TagAdd", tag });
}

function deleteTag(tag: string) {
  globalAppActor.send({ type: "TagDelete", tag });
}
</script>

<div
  data-popup="note-tags-more-{note.id}"
>
  <div
    class="flex border gap-2 p-2 bg-surface-500 rounded"
  >
    {#each note.tags.slice(2) as tag_}
      <button
        class="chip variant-ghost-secondary"
        on:click={() => addTag(tag_)}
      >
        {tag_}
      </button>
    {/each}
  </div>
</div>

<div class="bg-surface-500 p-2 border rounded flex justify-between gap-2">
  <div class="w-40 md:w-60 flex items-center">
    <button
      class="truncate"
      on:click={update}
    >
      {note.title}
    </button>
  </div>
  <div
    class="w-40 hidden md:flex gap-2"
  >
    {#each note.tags.slice(0, 2) as tag}
      <button
        class="chip variant-ghost-secondary"
        on:click={() => addTag(tag)}
      >
        {tag}
      </button>
    {/each}
    {#if note.tags.length > 2}
      <button
        class="chip variant-ghost-secondary"
        use:popup={{
          event: "click",
          target: "note-tags-more-" + note.id,
          placement: "right",
        }}
      >
        ...
      </button>
    {/if}
    {#if note.tags.length === 0}
      <button disabled class="chip variant-ghost-secondary">no tag yet</button>
    {/if}
  </div>
  <div class="w-40 hidden md:flex items-center">
    {formatDate(note.updatedAt)}
  </div>
  <!--TODO: improve the width of this to remove the redundant end gap-->
  <div class="w-24 flex items-center gap-2">
    {#if note.encryptionState === "none"}
      <button on:click={update}>
        <Fa icon={faEdit}></Fa>
      </button>
      <button on:click={copy}>
        <Fa icon={faCopy}></Fa>
      </button>
      <button on:click={encrypt}>
        <Fa icon={faLock}></Fa>
      </button>
    {:else if note.encryptionState === "encrypted"}
      <button class="invisible">
        <Fa icon={faEdit}></Fa>
      </button>
      <button on:click={decrypt_}>
        <Fa icon={faUnlock}></Fa>
      </button>
      <button on:click={clear}>
        <Fa icon={faKey}></Fa>
      </button>
    {:else if note.encryptionState === "decrypted"}
      <button on:click={update}>
        <Fa icon={faEdit}></Fa>
      </button>
      <button on:click={copy}>
        <Fa icon={faCopy}></Fa>
      </button>
      <button on:click={clear}>
        <Fa icon={faKey}></Fa>
      </button>
    {/if}
    <button on:click={delete_}>
      <Fa icon={faTrashCan}></Fa>
    </button>
  </div>
</div>
