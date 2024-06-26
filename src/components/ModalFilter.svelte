<script lang="ts">
import {
  InputChip,
  ProgressRadial,
  Tab,
  TabGroup,
} from "@skeletonlabs/skeleton";
import Fa from "svelte-fa";
import {
  faCancel,
  faCheck,
  faClose,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "@xstate/svelte";
import { onDestroy } from "svelte";
import { globalAppActor, globalClient } from "$lib/global";
import { derived } from "svelte/store";

const snapshot = useSelector(globalAppActor, (state) => state);
const tagsInclude = useSelector(globalAppActor, (state) => state.context.filterData.tagsInclude);
const tagsIncludeArray = Array.from($tagsInclude.keys());

function handleKeywordChange(e: Event) {
  const keyword = (e.target as HTMLInputElement).value;
  globalAppActor.send({ type: "SetKeyword", value: keyword });
}

function handleTagAdd(tag: string) {
  globalAppActor.send({ type: "TagAdd", tag });
}

function handleTagDelete(tag: string) {
  globalAppActor.send({ type: "TagDelete", tag });
}
</script>

<div class="card w-modal-slim">
  <section class="p-4 flex flex-col gap-4">
    <label class="label">
      <span>Search keyword</span>
      <input
        class="input"
        spellcheck="false"
        value={$snapshot.context.filterData.keyword}
        on:change={handleKeywordChange}
      />
    </label>
    <label>
      <span>Include tags</span>
      <InputChip
        name="tags"
        value={tagsIncludeArray}
        chips="variant-ghost-secondary"
        on:add={(e) => handleTagAdd(e.detail.chipValue)}
        on:remove={(e) => handleTagDelete(e.detail.chipValue)}
      />
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


