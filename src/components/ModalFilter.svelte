<script lang="ts">
import { InputChip } from "@skeletonlabs/skeleton";
import { useSelector } from "@xstate/svelte";
import { globalAppActor } from "$lib/global";
import { derived, get } from "svelte/store";
import {
  type FilterData,
  type FilterSortOption,
  writeFilterData,
} from "$lib/filter";

export let fnClose: () => void = () => {};

const snapshot = useSelector(globalAppActor, (state) => state);

let keyword: string = get(
  derived(snapshot, (snapshot) => snapshot.context.filterData.keyword),
);

const tagsIncludeSet = get(
  derived(snapshot, (snapshot) => snapshot.context.filterData.tagsInclude),
);
const tagsIncludeArray: string[] = Array.from(tagsIncludeSet);

const tagsExcludeSet = get(
  derived(snapshot, (snapshot) => snapshot.context.filterData.tagsExclude),
);
const tagsExcludeArray: string[] = Array.from(tagsExcludeSet);

let sortBy: FilterSortOption = get(
  derived(snapshot, (snapshot) => snapshot.context.filterData.sortBy),
);

function save() {
  const limit = get(
    derived(snapshot, (snapshot) => snapshot.context.filterData.limit),
  );
  const filterData: FilterData = {
    limit,
    keyword,
    tagsInclude: new Set(tagsIncludeArray),
    tagsExclude: new Set(tagsExcludeArray),
    sortBy,
  };
  globalAppActor.send({
    type: "SetFilterData",
    value: filterData,
  });
  fnClose();
  writeFilterData(filterData);
}
</script>

<div class="card w-modal-slim">
  <section class="p-4 flex flex-col gap-4">
    <label class="label">
      <span>Search keyword</span>
      <input
        class="input"
        spellcheck="false"
        bind:value={keyword}
      />
    </label>
    <label>
      <span>Include tags</span>
      <InputChip
        name="tags"
        value={tagsIncludeArray}
        chips="variant-ghost-secondary"
      />
    </label>
    <label>
      <span>Exclude tags</span>
      <InputChip
        name="tags"
        value={tagsExcludeArray}
        chips="variant-ghost-secondary"
      />
    </label>
    <label>
      <span>Sort by</span>
      <select class="select" bind:value={sortBy}>
        <option value="title-a-z">Title A to Z</option>
        <option value="title-z-a">Title Z to A</option>
        <option value="date-created-earliest-latest">Creation date earliest to latest</option>
        <option value="date-created-latest-earliest">Creation date latest to earliest</option>
        <option value="date-updated-earliest-latest">Updating date earliest to latest</option>
        <option value="date-updated-latest-earliest">Updating date latest to earliest</option>
      </select>
    </label>
  </section>
  <footer class="card-footer flex flex-row-reverse gap-2">
    <button
      class="btn variant-filled"
      on:click={save}
    >
      Save
    </button>
  </footer>
</div>


