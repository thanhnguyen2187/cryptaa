<script lang="ts">
import { CodeBlock } from "@skeletonlabs/skeleton";
import { Fa } from "svelte-fa";
import {
  faArrowsUpDown,
  faKey,
  faLock,
  faNoteSticky,
} from "@fortawesome/free-solid-svg-icons";
import { machine } from "$lib/machine-secret-ground";
import { useMachine } from "@xstate/svelte";
import { getToastStore } from "@skeletonlabs/skeleton";

const toastStore = getToastStore();

const { snapshot, send } = useMachine(machine, { input: { toastStore } });

function handleTextChanged(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  send({ type: "SetText", value });
}
function handlePasswordChanged(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  send({ type: "SetPassword", value });
}
function encrypt() {
  send({ type: "Encrypt" });
}
function swap() {
  send({ type: "SwapMode" });
}
</script>

<div class="container mt-4 mx-auto flex flex-col justify-center items-center">
  <div class="card p-4 w-full sm:w-80 flex flex-col gap-4">
    <label class="label">
      {#if $snapshot.context.mode === "encryption"}
        <span>Text to be encrypted</span>
      {:else if $snapshot.context.mode === "decryption"}
        <span>Text to be decrypted</span>
      {/if}
      <textarea
        class="textarea font-mono"
        rows="8"
        spellcheck="false"
        on:change={handleTextChanged}
      >{$snapshot.context.text}</textarea>
    </label>
    <label class="label">
      <span>Password</span>
      <input
        class="input"
        type="password"
        on:change={handlePasswordChanged}
      />
    </label>

    <label class="label">
      {#if $snapshot.context.mode === "encryption"}
        <span>Encrypted text</span>
      {:else if $snapshot.context.mode === "decryption"}
        <span>Decrypted text</span>
      {/if}
      <textarea
        class="textarea font-mono"
        rows="8"
        spellcheck="false"
        disabled
      >{$snapshot.context.textTarget}</textarea>
    </label>
    <div class="w-full flex flex-row-reverse gap-2">
      <button
        class="btn btn-icon variant-soft-secondary"
        on:click={encrypt}
      >
        <Fa icon={faKey}/>
      </button>
      <button
        class="btn btn-icon variant-soft-secondary"
        on:click={swap}
      >
        <Fa icon={faArrowsUpDown}/>
      </button>
    </div>

  </div>
</div>
