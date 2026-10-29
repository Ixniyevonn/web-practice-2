<script lang="ts">
	import { onMount } from "svelte";
	import { weatherInfo, windDirection } from "$lib/api/weather";
	import { city } from "$lib/content";
	import { cacheAgeLabel } from "$lib/core/storage";
	import { formatDayName, formatTemperature } from "$lib/core/format";
	import type { WeatherWidget } from "$lib/state/widgets/weather.svelte";
	import Icon from "../Icon.svelte";

	let { widget }: { widget: WeatherWidget } = $props();

	onMount(() => {
		if (widget.status === "idle") void widget.load();
	});

	const data = $derived(widget.data);
	const info = $derived(data ? weatherInfo(data.current.symbol) : null);
	const updated = $derived(widget.updatedAt ? cacheAgeLabel(widget.updatedAt) : "");
</script>

<div class="weather" aria-live="polite">
	{#if !data && (widget.status === "idle" || widget.status === "loading")}
		<div class="skeleton skeleton-temp"></div>
		<div class="skeleton skeleton-line"></div>
		<div class="skeleton skeleton-line short"></div>
	{:else if !data}
		<div class="error-panel">
			<Icon name="alert" size={22} />
			<div>
				<strong>Погода недоступна</strong>
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

		<div class="current">
			<div>
				<span class="muted-label">{city.name} · сейчас</span>
				<strong class="temp">{formatTemperature(data.current.temperature)}</strong>
			</div>
			<div class="condition">
				<Icon name={info?.icon ?? "cloud"} size={38} />
				<span>{info?.label}</span>
			</div>
		</div>

		<div class="details">
			<span><Icon name="wind" size={14} /> {data.current.windSpeed} км/ч, {windDirection(data.current.windDirection)}</span>
			<span><Icon name="droplet" size={14} /> {Math.round(data.current.humidity)}%</span>
			<span><Icon name="rain" size={14} /> {data.current.precipitation.toFixed(1)} мм</span>
		</div>

		<div class="forecast">
			{#each data.days as day, index}
				<div class="day" class:today={index === 0}>
					<span>{formatDayName(day.date, index)}</span>
					<Icon name={weatherInfo(day.symbol).icon} size={22} />
					<strong>{formatTemperature(day.max)} <span>{formatTemperature(day.min)}</span></strong>
				</div>
			{/each}
		</div>

		<div class="foot">
			<a href="https://www.met.no/" target="_blank" rel="noreferrer">MET Norway</a>
			<span>обновлено {updated}</span>
			<button type="button" aria-label="Обновить погоду" title="Обновить" onclick={() => widget.load()}>
				<Icon name="refresh" size={14} />
			</button>
		</div>
	{/if}
</div>

<style>
	.weather {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.current {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.muted-label {
		color: var(--muted);
		font-size: 0.82rem;
	}

	.temp {
		display: block;
		margin-top: 0.15rem;
		font-family: var(--f-mono);
		font-size: clamp(3rem, 7vw, 4.5rem);
		font-weight: 400;
		line-height: 1;
		letter-spacing: -0.08em;
	}

	.condition {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.35rem;
		max-width: 9rem;
		text-align: right;
		color: var(--blue);
	}

	.condition span {
		color: var(--ink);
		font-size: 0.9rem;
		line-height: 1.3;
	}

	.details {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1rem;
		padding: 0.7rem 0;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		color: var(--muted);
		font-size: 0.82rem;
	}

	.details span {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}

	.forecast {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}

	.day {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		padding: 0.7rem 0.4rem;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		text-align: center;
	}

	.day.today {
		border-color: var(--blue);
		background: var(--blue-soft);
	}

	.day > span {
		color: var(--muted);
		font-size: 0.72rem;
	}

	.day :global(svg) {
		color: var(--blue);
	}

	.day strong {
		font-family: var(--f-mono);
		font-size: 0.82rem;
		font-weight: 500;
	}

	.day strong span {
		color: var(--faint);
		font-weight: 400;
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
		padding: 1rem 0;
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

	.skeleton-temp {
		width: 7rem;
		height: 4.5rem;
	}

	.skeleton-line {
		width: 70%;
		height: 0.9rem;
	}

	.skeleton-line.short {
		width: 45%;
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
