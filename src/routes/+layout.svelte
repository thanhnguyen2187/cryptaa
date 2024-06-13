<script lang="ts">
import "../app.postcss";
import autoAnimate from "@formkit/auto-animate";
import {
	AppShell,
	AppBar,
	storePopup,
	initializeStores,
	Toast,
	Modal,
} from "@skeletonlabs/skeleton";
import { Fa } from "svelte-fa";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import {
	computePosition,
	autoUpdate,
	flip,
	shift,
	offset,
	arrow,
} from "@floating-ui/dom";
import { globalActorApp, globalClient } from '$lib/global';
import { useSelector } from '@xstate/svelte';
import { noteCount, notesRead } from '../data/queries-triplit';
import { derived } from 'svelte/store';

// Highlight JS
// import hljs from "highlight.js/lib/core";
// import "highlight.js/styles/github-dark.css";
// import { storeHighlightJs } from "@skeletonlabs/skeleton";
// import xml from "highlight.js/lib/languages/xml"; // for HTML
// import css from "highlight.js/lib/languages/css";
// import javascript from "highlight.js/lib/languages/javascript";
// import typescript from "highlight.js/lib/languages/typescript";

// hljs.registerLanguage("xml", xml); // for HTML
// hljs.registerLanguage("css", css);
// hljs.registerLanguage("javascript", javascript);
// hljs.registerLanguage("typescript", typescript);
// storeHighlightJs.set(hljs);

// Floating UI for Popups
initializeStores();
storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

const tags = useSelector(globalActorApp, (state) => state.context.searchTags);
const tagsArray = derived(tags, (tags) => Array.from(tags.values()));
const currentState = useSelector(globalActorApp, (state) => state);
const appSend = globalActorApp.send;

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

function removeTag(tag: string) {
	appSend({ type: "SearchTagRemove", tag });
	itemsLoad();
}

function setKeyword(keyword: string) {
	appSend({ type: "SearchKeywordSet", keyword });
	itemsLoad();
}

function handleSearchChange(e: Event) {
	const keyword = (e.target as HTMLInputElement).value;
	setKeyword(keyword);
}
</script>

<Toast/>
<Modal/>
<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar slotDefault="place-self-center">
			<svelte:fragment slot="lead">
				<strong class="hidden md:block text-xl uppercase">Cryptaa</strong>
			</svelte:fragment>
			<div
				class="input-group input-group-divider"
				class:grid-cols-[auto_1fr]={$tags.size === 0}
				class:grid-cols-[auto_1fr_auto]={$tags.size !== 0}
		 	>
        <div class="input-group-shim">
					<Fa icon={faSearch} />
        </div>
        <input
          type="text"
          placeholder="Search..."
					on:change={handleSearchChange}
        />
				<div
					class="flex gap-1"
				>
					{#each $tagsArray as tag}
						<button
							class="chip variant-ghost-secondary"
							on:click={() => removeTag(tag)}
						>
							{tag}
						</button>
					{/each}
				</div>
      </div>
			<svelte:fragment slot="trail">
				<strong class="text-xl uppercase invisible">Crypta</strong>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
