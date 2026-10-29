<script lang="ts">
	import { MAP_POINTS, type MapPoint } from "$lib/content";
	import type { MapWidget } from "$lib/state/widgets/map.svelte";
	import Icon from "../Icon.svelte";
	import RouteMap from "../map/RouteMap.svelte";

	let { widget }: { widget: MapWidget } = $props();

	const selected = $derived(widget.selectedPoint);
	const selectedId = $derived(widget.selectedId);
	let fitToken = $state(0);

	function numberFor(point: MapPoint): number {
		return MAP_POINTS.findIndex((entry) => entry.id === point.id) + 1;
	}
</script>

<div class="map-widget">
	<div class="map-head">
		<span class="muted-label">Восемь точек в центре</span>
		<button type="button" class="fit-button" onclick={() => (fitToken += 1)}>
			Показать все
		</button>
	</div>

	<RouteMap
		points={MAP_POINTS}
		selectedId={selectedId}
		{fitToken}
		onSelect={(id) => widget.select(id)}
	/>

	<div class="detail" aria-live="polite">
		{#if selected}
			<div>
				<span class="detail-number">{String(numberFor(selected)).padStart(2, "0")}</span>
				<div>
					<strong>{selected.name}</strong>
					<span class="detail-address">{selected.address}</span>
					<p>{selected.description}</p>
				</div>
			</div>
			<button type="button" class="clear" onclick={() => (widget.selectedId = null)}>
				<Icon name="close" size={14} />
				Сбросить
			</button>
		{:else}
			<div class="empty">
				<Icon name="pin" size={18} />
				<span>Нажмите на точку на карте или в списке, чтобы увидеть описание.</span>
			</div>
		{/if}
	</div>

	<ul class="point-list" aria-label="Точки прогулки">
		{#each MAP_POINTS as point}
			<li>
				<button
					type="button"
					class:active={widget.selectedId === point.id}
					aria-pressed={widget.selectedId === point.id}
					onclick={() => widget.select(point.id)}
				>
					<span class="point-number">{String(numberFor(point)).padStart(2, "0")}</span>
					<span class="point-name">{point.name}</span>
				</button>
			</li>
		{/each}
	</ul>

	<div class="map-foot">
		<span>Карта Esri</span>
		<span>не навигатор</span>
	</div>
</div>

<style>
	.map-widget {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.map-head {
		display: flex;
		justify-content: space-between;
		gap: 0.6rem;
	}

	.muted-label {
		color: var(--muted);
		font-size: 0.8rem;
	}

	.fit-button {
		color: var(--blue);
		font-size: 0.78rem;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.fit-button:hover {
		color: var(--ink);
	}

	.detail {
		min-height: 5rem;
		padding: 0.85rem;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--panel-2);
	}

	.detail > div:first-child {
		display: flex;
		gap: 0.7rem;
	}

	.detail-number {
		color: var(--blue);
		font-family: var(--f-mono);
		font-size: 0.8rem;
	}

	.detail strong {
		display: block;
		font-size: 0.95rem;
	}

	.detail-address {
		display: block;
		margin-top: 0.1rem;
		color: var(--faint);
		font-size: 0.75rem;
	}

	.detail p {
		margin: 0.3rem 0 0;
		color: var(--muted);
		font-size: 0.85rem;
		line-height: 1.45;
	}

	.clear {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		margin-top: 0.5rem;
		color: var(--muted);
		font-size: 0.75rem;
	}

	.clear:hover {
		color: var(--red);
	}

	.empty {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--muted);
		font-size: 0.85rem;
	}

	.point-list {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.35rem;
	}

	.point-list button {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		width: 100%;
		padding: 0.55rem 0.65rem;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		text-align: left;
		transition:
			border-color 150ms ease,
			background-color 150ms ease;
	}

	.point-list button:hover {
		border-color: var(--blue-line);
		background: var(--blue-soft);
	}

	.point-list button.active {
		border-color: var(--blue);
		background: var(--blue-soft);
	}

	.point-number {
		color: var(--blue);
		font-family: var(--f-mono);
		font-size: 0.7rem;
	}

	.point-name {
		font-size: 0.82rem;
		line-height: 1.3;
	}

	.map-foot {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		color: var(--faint);
		font-size: 0.7rem;
	}

	@media (max-width: 620px) {
		.point-list {
			grid-template-columns: 1fr;
		}
	}
</style>
