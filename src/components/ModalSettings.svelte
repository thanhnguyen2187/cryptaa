<script lang="ts">
import { ProgressRadial, Tab, TabGroup } from "@skeletonlabs/skeleton";
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

onDestroy(() => {
  const globalClientOptions = {
    serverUrl: $snapshot.context.connectionURL,
    token: $snapshot.context.connectionToken,
  };
  localStorage.setItem(
    "cryptaa.globalClientOptions",
    JSON.stringify(globalClientOptions),
  );

});

const snapshot = useSelector(globalActorSettings, (state) => state);
const send = globalActorSettings.send;

const connectionState = derived(snapshot, (snapshot_) => {
  if (snapshot_.matches("TabData.ConnectionState.Connecting")) {
    return "connecting";
  }
  if (snapshot_.matches("TabData.ConnectionState.Connected")) {
    return "connected";
  }
  if (snapshot_.matches("TabData.ConnectionState.Error")) {
    return "error";
  }
  if (snapshot_.matches("TabData.ConnectionState.None")) {
    return "none";
  }
});
const tabActivated = derived(snapshot, (snapshot_) => {
  if (snapshot_.matches("TabData")) {
    return "data";
  }
  if (snapshot_.matches("TabMiscellanies")) {
    return "miscellanies";
  }
});

function sendTabSwitched(value: "data" | "miscellanies") {
  switch (value) {
    case "data":
      send({ type: "TabSwitchedData" });
      break;
    case "miscellanies":
      send({ type: "TabSwitchedMiscellanies" });
      break;
  }
}

function handleConnectionURLInputChanged(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  send({ type: "ConnectionURLSet", value });
  updateGlobalClientOptions();
}
function handleConnectionTokenInputChanged(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  send({ type: "ConnectionTokenSet", value });
  updateGlobalClientOptions();
}

function updateGlobalClientOptions() {
  try {
    globalClient.updateOptions({
      serverUrl: $snapshot.context.connectionURL,
      token: $snapshot.context.connectionToken,
    });
  } catch (e: unknown) {
    console.warn(e);
    send({ type: "Failed" });
  }
}

const miscText = `
- Powered by: Skeleton, Svelte, SvelteKit, XState, and Triplit
- Bug report/feature request: https://github.com/thanhnguyen2187/cryptaa/issues
`.trim();
</script>

<div class="card p-4 pt-2 w-modal-slim">
  <TabGroup>
    <Tab
      group={$tabActivated}
      name="data"
      value={"data"}
      on:change={() => sendTabSwitched("data")}
    >
      <span>Data</span>
    </Tab>
    <Tab
      group={$tabActivated}
      name="miscellanies"
      value={"miscellanies"}
      on:change={() => sendTabSwitched("miscellanies")}
    >
      <span>Miscellanies</span>
    </Tab>
    <!-- Tab Panels --->
    <svelte:fragment slot="panel">
      <div class="flex flex-col gap-2 h-56">
        {#if $tabActivated === "data"}
          <label class="label">
            <span>Connection URL</span>
            <input
              class="input"
              spellcheck="false"
              value={$snapshot.context.connectionURL}
              on:change={handleConnectionURLInputChanged}
            />
          </label>
          <label class="label">
            <span>Token</span>
            <input
              class="input"
              spellcheck="false"
              value={$snapshot.context.connectionToken}
              on:change={handleConnectionTokenInputChanged}
            />
          </label>
          <div
            class="grow rounded flex flex-row justify-center items-center mt-4 p-2 gap-2"
            class:bg-success-800={$connectionState === "connected"}
            class:bg-secondary-500={$connectionState === "connecting"}
            class:bg-error-700={$connectionState === "error"}
            class:bg-tertiary-800={$connectionState === "none"}
          >
            {#if $connectionState === "none"}
              <span>Please input URL and token</span>
            {:else if $connectionState === "connected"}
              <Fa icon={faCheck} />
              <span>Succeeded</span>
            {:else if $connectionState === "connecting"}
              <Fa icon={faEllipsis} class="animate-pulse" />
              <span>Connecting</span>
            {:else if $connectionState === "error"}
              <Fa icon={faClose} />
              <span>Failed. Recheck your URL or token.</span>
            {/if}
          </div>
        {:else if $tabActivated === "miscellanies"}
          <div class="grow">
            <pre class="whitespace-pre-wrap">{miscText}</pre>
          </div>
        {/if}
      </div>
    </svelte:fragment>
  </TabGroup>
</div>


