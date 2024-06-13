<script lang="ts">
import { formatDate } from "$lib/date";
import { globalClient } from "$lib/global";
import {
	faCopy,
	faEdit,
	faKey,
	faLock,
	faTrashCan,
	faUnlock,
} from "@fortawesome/free-solid-svg-icons";
import {
	InputChip,
	getModalStore,
	getToastStore,
  popup,
} from "@skeletonlabs/skeleton";
import { useMachine } from "@xstate/svelte";
import { Fa } from "svelte-fa";
import { aesGcmDecrypt } from "../data/encryption";
import type { NoteDisplay } from "../data/schema-triplit";
import ModalEncryption from "./ModalEncryption.svelte";
import { notesUpsert } from '../data/queries-triplit';
import { copyToClipboard } from '$lib/clipboard';

const modalStore = getModalStore();
const toastStore = getToastStore();

export let note: NoteDisplay;
export let fnUpdate: (note: NoteDisplay) => void;
export let fnEncrypt: (note: NoteDisplay) => void;
export let fnDelete: (noteId: string) => void;
export let fnTagAdd: (tag: string) => void;

let state: "idling" | "encrypted" | "decrypted" = "idling";

function decrypt() {
	modalStore.trigger({
		type: "component",
		component: {
			ref: ModalEncryption,
			props: {
				note,
        showWarning: false,
				fnCancel: modalStore.close,
				fnSubmit: async (password: string) => {
					try {
						const decryptedText = await aesGcmDecrypt(note.text, password);
						note.text = decryptedText;
						note.encrypted = false;
						state = "decrypted";
            toastStore.trigger({
              message: "Decrypted successfully!",
              background: "variant-ghost-success",
              timeout: 2000,
            });
					} catch (e: unknown) {
						// @ts-ignore
						if ("message" in e && e.message === "Decrypt failed") {
							toastStore.trigger({
								message: "Incorrect password!",
								background: "variant-ghost-warning",
								timeout: 2000,
							});
						} else {
							console.error(e);
						}
					} finally {
						modalStore.close();
					}
				},
			},
		},
	});
}

async function clear() {
	if (state === "decrypted") {
    await notesUpsert(globalClient, note);
    state = "idling";
	} else if (state === "encrypted") {
    modalStore.trigger({
      type: "component",
      component: {
        ref: ModalEncryption,
        props: {
          note,
          showWarning: false,
          fnCancel: modalStore.close,
          fnSubmit: async (password: string) => {
            try {
              const decryptedText = await aesGcmDecrypt(note.text, password);
              note.text = decryptedText;
              note.encrypted = false;
              state = "idling";
              toastStore.trigger({
                message: "Decrypted successfully!",
                background: "variant-ghost-success",
                timeout: 2000,
              });
              await notesUpsert(globalClient, note);
            } catch (e: unknown) {
              // @ts-ignore
              if ("message" in e && e.message === "Decrypt failed") {
                toastStore.trigger({
                  message: "Incorrect password!",
                  background: "variant-ghost-warning",
                  timeout: 2000,
                });
              } else {
                console.error(e);
              }
            } finally {
              modalStore.close();
            }
          },
        },
      },
    });
  }
}

async function copy() {
  const result = await copyToClipboard(note.text)
  if (result === 'success') {
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

$: {
	if (note.encrypted && state === "idling") {
		state = "encrypted";
	}
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
        on:click={() => fnTagAdd(tag_)}
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
      on:click={() => fnUpdate(note)}
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
        on:click={() => fnTagAdd(tag)}
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
    {#if state === "idling"}
      <button on:click={() => fnUpdate(note)}>
        <Fa icon={faEdit}></Fa>
      </button>
      <button on:click={copy}>
        <Fa icon={faCopy}></Fa>
      </button>
      <button on:click={() => fnEncrypt(note)}>
        <Fa icon={faLock}></Fa>
      </button>
    {:else if state === "encrypted"}
      <button class="invisible">
        <Fa icon={faEdit}></Fa>
      </button>
      <button on:click={decrypt}>
        <Fa icon={faUnlock}></Fa>
      </button>
      <button on:click={clear}>
        <Fa icon={faKey}></Fa>
      </button>
    {:else if state === "decrypted"}
      <button>
        <Fa icon={faEdit}></Fa>
      </button>
      <button on:click={copy}>
        <Fa icon={faCopy}></Fa>
      </button>
      <button on:click={clear}>
        <Fa icon={faKey}></Fa>
      </button>
    {/if}
    <button on:click={() => fnDelete(note.id)}>
      <Fa icon={faTrashCan}></Fa>
    </button>
  </div>
</div>
