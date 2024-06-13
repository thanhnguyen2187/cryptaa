<script lang="ts">
import NoteItemList from "./NoteItemList.svelte";
import type { NoteDisplay } from "../data/schema-triplit";
import { Fa } from "svelte-fa";
import {
  faArrowRotateRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { noteCount, notesRead } from '../data/queries-triplit';
import { globalActorApp, globalClient } from '$lib/global';
import { useSelector } from '@xstate/svelte';

export let notes: NoteDisplay[] = [];
export let fnUpdate: (note: NoteDisplay) => void;
export let fnEncrypt: (note: NoteDisplay) => void;
export let fnDelete: (noteId: string) => void;
export let fnTagAdd: (tag: string) => void;

const currentState = useSelector(globalActorApp, (state) => state);
const appSend = globalActorApp.send;
const tags = useSelector(globalActorApp, (state) => state.context.searchTags);

async function itemsLoad() {
  try {
    const notes = await notesRead(
      globalClient,
      $currentState.context.limit,
      $currentState.context.searchKeyword,
      $tags,
    );
    const count = await noteCount(
      globalClient,
      $currentState.context.searchKeyword,
      $tags,
    );
    appSend({ type: "Loaded", notes, totalCount: count });
  } catch (e) {
    appSend({ type: "FailedData" });
    console.error(e);
  }
}

function increaseLimit() {
  const limit = $currentState.context.limit;
  const limitIncreased = limit + 10;
  appSend({type: "LimitSet", limit: limitIncreased});
  itemsLoad();
}

function reload() {
  appSend({type: "LimitSet", limit: 10});
  itemsLoad();
}

const showAddMore = useSelector(globalActorApp, (state) => state.context.limit < state.context.notesTotalCount);
</script>

<div class="flex flex-col gap-2">
  {#each notes as note(note.id)}
    <NoteItemList
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
      on:click={increaseLimit}
      class:hidden={!$showAddMore}
    >
      <Fa icon={faChevronDown} class=""></Fa>
      <span>More</span>
    </button>
    <button
      class="btn variant-ghost-secondary"
      on:click={reload}
    >
      <Fa icon={faArrowRotateRight} class=""></Fa>
      <span>Reload</span>
    </button>
  </div>
</div>
