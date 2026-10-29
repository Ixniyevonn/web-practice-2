<script lang="ts">
	import { onMount } from "svelte";
	import { city, site } from "$lib/content";
	import { formatDateLong, formatTime } from "$lib/core/format";
	import Icon from "./Icon.svelte";

	let {
		widgetCount,
		storageNotice = "",
		onAdd,
		onReset
	}: {
		widgetCount: number;
		storageNotice?: string;
		onAdd: () => void;
		onReset: () => void;
	} = $props();

	let now = $state<Date | null>(null);

	onMount(() => {
		now = new Date();
		const timer = window.setInterval(() => {
			now = new Date();
		}, 1000);
		return () => window.clearInterval(timer);
	});
</script>

<header class="site-header">
	<div class="header-main container">
		<a class="brand" href="#dashboard" aria-label="Путевой журнал — к панели">
			<span class="monogram" aria-hidden="true">ПЖ</span>
			<span class="brand-text">
				<strong>{site.title}</strong>
				<span>{city.name}</span>
			</span>
		</a>

		<div class="header-right">
			<div class="now">
				<strong>{now ? formatTime(now) : "--:--"}</strong>
				<span>{now ? formatDateLong(now) : city.name}</span>
			</div>
			<button type="button" class="btn btn-primary" onclick={onAdd} aria-label="Добавить виджет">
				<Icon name="plus" size={16} />
				<span class="add-label">Добавить</span>
				<span class="count">{widgetCount}</span>
			</button>
			<button
				type="button"
				class="btn btn-icon"
				onclick={onReset}
				aria-label="Сбросить панель"
				title="Сбросить панель"
			>
				<Icon name="refresh" size={17} />
			</button>
		</div>
	</div>

	{#if storageNotice}
		<div class="notice container" role="status">
			<Icon name="alert" size={14} />
			<span>{storageNotice}</span>
		</div>
	{/if}
</header>

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 70;
		border-bottom: 1px solid var(--line);
		background: rgba(255, 255, 255, 0.96);
		backdrop-filter: blur(10px);
	}

	.header-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		min-height: 4.4rem;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		min-width: 0;
	}

	.monogram {
		display: grid;
		place-items: center;
		width: 2.3rem;
		height: 2.3rem;
		flex-shrink: 0;
		border-radius: var(--radius);
		background: var(--blue);
		color: #fff;
		font-family: var(--f-mono);
		font-size: 0.72rem;
		font-weight: 600;
	}

	.brand-text {
		display: flex;
		flex-direction: column;
		gap: 0.05rem;
		min-width: 0;
	}

	.brand-text strong {
		font-size: 0.98rem;
		letter-spacing: -0.02em;
		line-height: 1.15;
	}

	.brand-text span {
		color: var(--muted);
		font-size: 0.75rem;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.now {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		margin-right: 0.4rem;
	}

	.now strong {
		font-family: var(--f-mono);
		font-size: 0.95rem;
		font-weight: 500;
		line-height: 1.1;
	}

	.now span {
		color: var(--muted);
		font-size: 0.7rem;
	}

	.count {
		display: inline-grid;
		place-items: center;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.25rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.22);
		font-size: 0.65rem;
	}

	.notice {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0 0.55rem;
		color: var(--amber);
		font-size: 0.75rem;
	}

	@media (max-width: 760px) {
		.header-main {
			min-height: 4rem;
		}

		.now span {
			display: none;
		}

		.now strong {
			font-size: 0.85rem;
		}

		.add-label {
			display: none;
		}

		.header-right .btn-primary {
			width: 2.5rem;
			padding: 0;
		}

		.count {
			display: none;
		}
	}

	@media (max-width: 460px) {
		.brand-text span {
			display: none;
		}

		.now {
			display: none;
		}
	}
</style>
