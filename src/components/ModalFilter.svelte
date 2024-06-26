<script lang="ts">
  import { InputChip, ProgressRadial, Tab, TabGroup } from "@skeletonlabs/skeleton";
import Fa from "svelte-fa";
import {
  faCancel,
  faCheck,
  faClose,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "@xstate/svelte";
import { onDestroy } from "svelte";
import { globalActorSettings, globalClient } from "$lib/global";
import { derived } from "svelte/store";

const snapshot = useSelector(globalActorSettings, (state) => state);
const send = globalActorSettings.send;
</script>

<div class="card w-modal-slim">
  <section class="p-4 flex flex-col gap-4">
    <label class="label">
      <span>Search keyword</span>
      <input
        class="input"
        spellcheck="false"
      />
    </label>
    <label>
      <span>Include tags</span>
      <InputChip name="tags"/>
    </label>
    <label>
      <span>Exclude tags</span>
      <InputChip name="tags"/>
    </label>
    <label>
      <span>Sort by</span>
      <select class="select">
        <option>Title A to Z</option>
        <option>Title Z to A</option>
        <option>Creation date earliest to latest</option>
        <option>Creation date latest to earliest</option>
        <option>Updating date earliest to latest</option>
        <option>Updating date latest to earliest</option>
      </select>
    </label>
  </section>
  <footer class="card-footer flex flex-row-reverse gap-2">
    <button
      class="btn variant-filled"
    >
      Save
    </button>
  </footer>
</div>


