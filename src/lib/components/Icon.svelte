<script lang="ts">
	import { iconPaths, type IconName } from "$lib/icons";

	let {
		name,
		size = 18,
		strokeWidth = 1.6,
		class: className = ""
	}: {
		name: IconName;
		size?: number;
		strokeWidth?: number;
		class?: string;
	} = $props();

	const paths = $derived(iconPaths[name] ?? []);
</script>

<svg
	class={className}
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="square"
	stroke-linejoin="miter"
	aria-hidden="true"
	focusable="false"
>
	{#each paths as d}
		<path {d} />
	{/each}
</svg>
