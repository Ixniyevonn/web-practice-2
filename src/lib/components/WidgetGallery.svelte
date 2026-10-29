<script lang="ts">
	import { WIDGET_META, WIDGET_ORDER, type WidgetType } from "$lib/content";
	import type { Dashboard } from "$lib/state/dashboard.svelte";
	import Icon from "./Icon.svelte";
	import Modal from "./Modal.svelte";

	let {
		open = $bindable(false),
		dashboard
	}: {
		open?: boolean;
		dashboard: Dashboard;
	} = $props();

	let message = $state("");
	let messageTone = $state<"ok" | "error">("ok");

	function add(type: WidgetType): void {
		const result = dashboard.add(type);
		message = result.message;
		messageTone = result.ok ? "ok" : "error";
	}
</script>

<Modal
	bind:open
	wide
	title="Добавить виджет"
	description="Восемь карточек с разными функциями. Один тип можно добавить только один раз; удалить карточку можно через её меню."
>
	<div class="gallery">
		{#each WIDGET_ORDER as type}
			{@const meta = WIDGET_META[type]}
			{@const added = dashboard.has(type)}
			<article class="gallery-item" class:added>
				<span class="gallery-icon" aria-hidden="true">
					<Icon name={meta.icon} size={19} />
				</span>
				<div class="gallery-copy">
					<div class="gallery-title">
						<h3>{meta.title}</h3>
					</div>
					<p>{meta.description}</p>
				</div>
				<button
					type="button"
					class="gallery-add"
					class:added
					disabled={added}
					aria-label={added ? `${meta.title} уже на панели` : `Добавить виджет «${meta.title}»`}
					onclick={() => add(type)}
				>
					{#if added}
						<Icon name="check" size={14} />
						На панели
					{:else}
						<Icon name="plus" size={14} />
						Добавить
					{/if}
				</button>
			</article>
		{/each}
	</div>

	{#if message}
		<p class="gallery-message" data-tone={messageTone} role="status">{message}</p>
	{/if}

	{#snippet footer()}
		<span class="gallery-count mono">{dashboard.count} / {WIDGET_ORDER.length} ВИДЖЕТОВ</span>
		<button type="button" class="btn btn-primary" onclick={() => (open = false)}>Готово</button>
	{/snippet}
</Modal>

<style>
	.gallery {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.gallery-item {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: start;
		gap: 0.55rem;
		padding: 0.7rem;
		border: 1px solid var(--line);
		background: var(--bg);
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.gallery-item:hover {
		border-color: var(--blue-line);
	}

	.gallery-item.added {
		background: var(--panel-2);
	}

	.gallery-icon {
		display: grid;
		place-items: center;
		width: 2.1rem;
		height: 2.1rem;
		border: 1px solid var(--blue-line);
		color: var(--blue);
		background: var(--blue-soft);
	}

	.gallery-copy {
		min-width: 0;
	}

	.gallery-title {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.4rem;
	}

	.gallery-title h3 {
		font-size: 0.9rem;
		font-weight: 650;
		letter-spacing: -0.01em;
	}

	.gallery-copy p {
		margin: 0.2rem 0 0;
		color: var(--muted);
		font-size: 0.8rem;
		line-height: 1.4;
	}

	.gallery-add {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.35rem 0.45rem;
		border: 1px solid var(--line-strong);
		color: var(--ink);
		font-family: var(--f-mono);
		font-size: 0.60rem;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.gallery-add:hover:not(:disabled) {
		border-color: var(--blue);
		background: var(--blue);
		color: #fff;
	}

	.gallery-add.added {
		color: var(--green);
		border-color: var(--green-line);
		background: var(--green-soft);
		cursor: default;
	}

	.gallery-message {
		margin: 0.8rem 0 0;
		padding: 0.55rem 0.65rem;
		border: 1px solid var(--line);
		font-size: 0.68rem;
	}

	.gallery-message[data-tone="ok"] {
		border-color: var(--green-line);
		background: var(--green-soft);
		color: var(--green);
	}

	.gallery-message[data-tone="error"] {
		border-color: var(--red-line);
		background: var(--red-soft);
		color: var(--red);
	}

	.gallery-count {
		margin-right: auto;
		align-self: center;
		color: var(--faint);
		font-size: 0.60rem;
	}

	@media (max-width: 720px) {
		.gallery {
			grid-template-columns: 1fr;
		}

		.gallery-item {
			grid-template-columns: auto 1fr;
		}

		.gallery-add {
			grid-column: 1 / -1;
			justify-content: center;
		}
	}
</style>
