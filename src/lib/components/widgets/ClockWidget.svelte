<script lang="ts">
	import { onMount } from "svelte";
	import { WORLD_CITIES } from "$lib/content";
	import { formatDateInZone, formatOffset, formatTimeInZone } from "$lib/core/format";
	import type { ClockWidget } from "$lib/state/widgets/clock.svelte";

	let { widget }: { widget: ClockWidget } = $props();

	onMount(() => {
		widget.start();
		return () => widget.destroy();
	});

	const now = $derived(widget.now);
</script>

<div class="clock">
	<div class="grid">
		{#each WORLD_CITIES as city}
			<div class="city" class:highlight={city.highlight}>
				<span class="name">{city.name}</span>
				<strong>{now ? formatTimeInZone(now, city.timeZone, true) : "--:--:--"}</strong>
				<span class="meta">
					{now ? formatDateInZone(now, city.timeZone) : "—"}
					· {now ? formatOffset(now, city.timeZone) : "—"}
				</span>
			</div>
		{/each}
	</div>
	<span class="foot">Системное время</span>
</div>

<style>
	.clock {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.city {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0.7rem;
		border: 1px solid var(--line);
		border-radius: var(--radius);
	}

	.city.highlight {
		border-color: var(--blue-line);
		background: var(--blue-soft);
	}

	.name {
		color: var(--muted);
		font-size: 0.78rem;
	}

	.city strong {
		font-family: var(--f-mono);
		font-size: 1.15rem;
		font-weight: 400;
		line-height: 1.2;
	}

	.city.highlight strong {
		color: var(--blue);
	}

	.meta {
		color: var(--faint);
		font-size: 0.7rem;
	}

	.foot {
		color: var(--faint);
		font-size: 0.7rem;
	}

	@media (max-width: 420px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
