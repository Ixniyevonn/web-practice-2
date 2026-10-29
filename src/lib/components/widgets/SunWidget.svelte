<script lang="ts">
	import { onMount } from "svelte";
	import { sunProgress } from "$lib/api/sun";
	import { cacheAgeLabel } from "$lib/core/storage";
	import { formatMinutes } from "$lib/core/format";
	import type { SunWidget } from "$lib/state/widgets/sun.svelte";
	import Icon from "../Icon.svelte";

	let { widget }: { widget: SunWidget } = $props();

	let now = $state(new Date());

	onMount(() => {
		if (widget.status === "idle") void widget.load();
		now = new Date();
		const timer = window.setInterval(() => {
			now = new Date();
		}, 60_000);
		return () => window.clearInterval(timer);
	});

	const data = $derived(widget.data);
	const updated = $derived(widget.updatedAt ? cacheAgeLabel(widget.updatedAt) : "");
	const position = $derived(
		data ? sunProgress(data.sunrise, data.sunset, now) : { progress: 0, isDay: false }
	);
	const point = $derived({
		x: 120 - 100 * Math.cos(Math.PI * position.progress),
		y: 100 - 100 * Math.sin(Math.PI * position.progress)
	});
</script>

<div class="sun" aria-live="polite">
	{#if !data && (widget.status === "idle" || widget.status === "loading")}
		<div class="skeleton skeleton-arc"></div>
		<div class="skeleton skeleton-line"></div>
	{:else if !data}
		<div class="error-panel">
			<Icon name="alert" size={22} />
			<div>
				<strong>Солнце недоступно</strong>
				<p>{widget.error || "Сервис не ответил."}</p>
			</div>
			<button type="button" class="btn btn-outline btn-small" onclick={() => widget.load()}>
				<Icon name="refresh" size={14} />
				Повторить
			</button>
		</div>
	{:else}
		{#if widget.status === "error"}
			<div class="cache-note" role="status">
				<Icon name="alert" size={14} />
				<span>{widget.error} Показаны последние данные.</span>
				<button type="button" onclick={() => widget.load()}>Повторить</button>
			</div>
		{/if}

		<div class="head">
			<div>
				<span class="muted-label">Световой день</span>
				<strong>{formatMinutes(data.daylightMinutes)}</strong>
			</div>
			<span class="state" class:night={!position.isDay}>
				<Icon name={position.isDay ? "sun" : "moon"} size={16} />
				{position.isDay ? "солнце над горизонтом" : "солнце за горизонтом"}
			</span>
		</div>

		<svg class="arc" viewBox="0 0 240 122" role="img" aria-label="Положение солнца на небе">
			<path class="horizon" d="M8 101h224" />
			<path class="arc-line" d="M20 100A100 100 0 0 1 220 100" />
			<line class="sun-line" x1={point.x} y1={point.y} x2={point.x} y2="100" />
			<circle class="sun-dot" cx={point.x} cy={point.y} r="6" />
			<text x="20" y="116" text-anchor="middle">{data.sunrise.slice(11, 16)}</text>
			<text x="220" y="116" text-anchor="middle">{data.sunset.slice(11, 16)}</text>
			<text x="120" y="116" text-anchor="middle" class="noon-label">
				полдень {data.solarNoon.slice(11, 16)}
			</text>
		</svg>

		<div class="metrics">
			<div><span>Восход</span><strong>{data.sunrise.slice(11, 16)}</strong></div>
			<div><span>Закат</span><strong>{data.sunset.slice(11, 16)}</strong></div>
			<div><span>Полдень</span><strong>{data.solarNoon.slice(11, 16)}</strong></div>
		</div>

		<div class="foot">
			<a href="https://www.met.no/" target="_blank" rel="noreferrer">MET Norway</a>
			<span>обновлено {updated}</span>
			<button type="button" aria-label="Обновить данные о солнце" title="Обновить" onclick={() => widget.load()}>
				<Icon name="refresh" size={14} />
			</button>
		</div>
	{/if}
</div>

<style>
	.sun {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.8rem;
	}

	.muted-label {
		color: var(--muted);
		font-size: 0.82rem;
	}

	.head strong {
		display: block;
		margin-top: 0.1rem;
		font-family: var(--f-mono);
		font-size: 1.8rem;
		font-weight: 400;
		line-height: 1;
	}

	.state {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--blue);
		font-size: 0.75rem;
		text-align: right;
	}

	.state.night {
		color: var(--muted);
	}

	.arc {
		width: 100%;
		height: auto;
	}

	.horizon {
		stroke: var(--line-strong);
		stroke-width: 1;
	}

	.arc-line {
		fill: none;
		stroke: var(--blue-line);
		stroke-width: 2;
	}

	.sun-line {
		stroke: var(--blue-line);
		stroke-width: 1;
		stroke-dasharray: 2 3;
	}

	.sun-dot {
		fill: var(--blue);
		stroke: var(--panel);
		stroke-width: 3;
	}

	.arc text {
		fill: var(--faint);
		font-family: var(--f-mono);
		font-size: 9px;
	}

	.noon-label {
		fill: var(--muted);
	}

	.metrics {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
	}

	.metrics > div {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0.6rem 0;
	}

	.metrics > div + div {
		padding-left: 0.7rem;
		border-left: 1px solid var(--line);
	}

	.metrics span {
		color: var(--faint);
		font-size: 0.72rem;
	}

	.metrics strong {
		font-family: var(--f-mono);
		font-size: 0.9rem;
		font-weight: 500;
	}

	.foot {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: auto;
		color: var(--faint);
		font-size: 0.72rem;
	}

	.foot a {
		margin-right: auto;
		color: var(--muted);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.foot button {
		display: grid;
		place-items: center;
		width: 1.9rem;
		height: 1.9rem;
		border-radius: var(--radius);
		color: var(--muted);
	}

	.foot button:hover {
		background: var(--blue-soft);
		color: var(--blue);
	}

	.error-panel {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.7rem;
		color: var(--red);
	}

	.error-panel strong {
		display: block;
		margin-bottom: 0.2rem;
		color: var(--ink);
	}

	.error-panel p {
		margin: 0;
		color: var(--muted);
		font-size: 0.8rem;
	}

	.cache-note {
		display: flex;
		align-items: flex-start;
		gap: 0.4rem;
		padding: 0.55rem 0.65rem;
		border-radius: var(--radius);
		background: var(--amber-soft);
		color: var(--amber);
		font-size: 0.75rem;
	}

	.cache-note span {
		flex: 1;
	}

	.cache-note button {
		color: var(--amber);
		font-size: 0.72rem;
		text-decoration: underline;
	}

	.skeleton {
		border-radius: var(--radius);
		background: linear-gradient(90deg, var(--line) 25%, var(--panel-2) 50%, var(--line) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.4s linear infinite;
	}

	.skeleton-arc {
		height: 8rem;
	}

	.skeleton-line {
		width: 60%;
		height: 0.9rem;
	}

	@keyframes shimmer {
		to {
			background-position: -200% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton {
			animation: none;
		}
	}
</style>
