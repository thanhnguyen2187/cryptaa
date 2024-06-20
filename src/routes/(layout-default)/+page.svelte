<script lang="ts">
import { globalAppActor, globalClient } from "$lib/global";
import { useSelector } from "@xstate/svelte";
import NoteList from "../../components/NoteList.svelte";
import { faAdd, faGear } from "@fortawesome/free-solid-svg-icons";
import { Fa } from "svelte-fa";

const globalAppState = useSelector(globalAppActor, (snapshot) => snapshot);

function sendModalOpenNoteNew() {
  globalAppActor.send({type: "ModalOpenNoteNew"})
}

function sendModalOpenSettings() {
  globalAppActor.send({type: "ModalOpenSettings"})
}
</script>

<div>{JSON.stringify($globalAppState.value)}</div>
{#if $globalAppState.matches("Idling")}
  <button
    class="btn-icon variant-filled-secondary absolute bottom-6 left-6"
    on:click={sendModalOpenSettings}
  >
    <Fa icon={faGear} size="lg"/>
  </button>
  <button
    class="btn-icon variant-filled-secondary absolute bottom-6 right-6"
    on:click={sendModalOpenNoteNew}
  >
    <Fa icon={faAdd} size="lg"/>
  </button>
{/if}
<div class="container mt-4 mx-auto flex justify-center items-center">
  {#if $globalAppState.matches("Idling")}
    {#if $globalAppState.context.notes.length === 0}
      <p>
        There is nothing here for now. <br/>
        You might want to <button class="underline" on:click={sendModalOpenNoteNew}>create one</button>?
      </p>
    {:else}
      <NoteList notes={$globalAppState.context.notes}/>
    {/if}
  {/if}
</div>

<style lang="postcss"></style>
