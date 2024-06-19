<script lang="ts">
import Item from "./NoteListItem.svelte";
import type { NoteDisplay } from "../data/schema-triplit";
import { Fa } from "svelte-fa";
import {
  faArrowRotateRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { globalAppActor } from "$lib/global";
import { useSelector } from "@xstate/svelte";

export let notes: NoteDisplay[] = [];
export let fnUpdate: (note: NoteDisplay) => void;
export let fnEncrypt: (note: NoteDisplay) => void;
export let fnDelete: (noteId: string) => void;
export let fnTagAdd: (tag: string) => void;

function reload() {
  globalAppActor.send({ type: "Reload" });
}

function loadMore() {
  const limit = globalAppActor.getSnapshot().context.limit;
  globalAppActor.send({ type: "SetLimit", value: limit + 10 });
  globalAppActor.send({ type: "Reload" });
}

const showAddMore = useSelector(
  globalAppActor,
  (state) => state.context.limit < state.context.notesTotalCount,
);
</script>

<div class="flex flex-col gap-2">
  {#each notes as note(note.id)}
    <Item
      {note}
      {fnUpdate}
      {fnEncrypt}
      {fnDelete}
      {fnTagAdd}
    />
  {/each}
  <div class="flex flex-row-reverse gap-2">
    <button
      class="btn variant-ghost-secondary"
      on:click={reload}
    >
      <Fa icon={faArrowRotateRight} class=""></Fa>
      <span>Reload</span>
    </button>
    <button
      class="btn variant-ghost-secondary"
      on:click={loadMore}
      class:hidden={!$showAddMore}
    >
      <Fa icon={faChevronDown} class=""></Fa>
      <span>More</span>
    </button>
  </div>
</div>
