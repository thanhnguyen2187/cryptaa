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

const snapshot = useSelector(globalActorSettings, (state) => state);
const send = globalActorSettings.send;
</script>

<div class="card p-4 pt-2 w-modal-slim">
  Hello world
</div>


