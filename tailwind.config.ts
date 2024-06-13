import { join } from "node:path";
import { skeleton } from "@skeletonlabs/tw-plugin";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";

export default {
	darkMode: "class",
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		join(
			require.resolve("@skeletonlabs/skeleton"),
			"../**/*.{html,js,svelte,ts}",
		),
	],
	theme: {
		extend: {},
	},
	plugins: [
		forms,
		typography,
		skeleton({
			themes: {
				preset: [
					{
						name: "crimson",
						enhancements: true,
					},
				],
			},
		}),
	],
} satisfies Config;
