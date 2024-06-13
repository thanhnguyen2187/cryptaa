<script lang="ts">
import { Fa } from "svelte-fa";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons";

export let title = "Unnamed";
</script>

<div class="bg-surface-500 p-2 border rounded flex justify-between gap-2 w-80">
  <div>
    {title}
  </div>
  <div class="flex items-center gap-2">
    <Fa icon={faLock}></Fa>
    <Fa icon={faTrashCan}></Fa>
  </div>
</div>
