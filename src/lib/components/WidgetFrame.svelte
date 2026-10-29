<script lang="ts">
	import { onMount, type Snippet } from "svelte";
	import type { Widget } from "$lib/state/widget.svelte";
	import { WIDGET_META } from "$lib/content";
	import Icon from "./Icon.svelte";

	let {
		widget,
		index,
		total,
		dragging = false,
		dragStyle,
		onMove,
		onRemove,
		onDragStart,
		children
	}: {
		widget: Widget;
		index: number;
		total: number;
		dragging?: boolean;
		dragStyle?: string;
		onMove: (direction: -1 | 1) => void;
		onRemove: () => void;
		onDragStart: (event: PointerEvent, card: HTMLElement | undefined) => void;
		children: Snippet;
	} = $props();

	const meta = $derived(WIDGET_META[widget.type]);
	let menu = $state<HTMLDetailsElement>();
	let card = $state<HTMLElement>();

	onMount(() => {
		const onPointerDown = (event: PointerEvent) => {
			if (!menu?.open) return;
			if (event.target instanceof Node && menu.contains(event.target)) return;
			menu.open = false;
		};
		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	});

	function closeMenu(): void {
		if (menu) menu.open = false;
	}

	function move(direction: -1 | 1): void {
		closeMenu();
		onMove(direction);
	}

	function remove(): void {
		closeMenu();
		onRemove();
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
		event.preventDefault();
		move(event.key === "ArrowUp" ? -1 : 1);
	}
</script>

<article
	class="widget"
	class:dragging
	class:span-4={meta.span === 4}
	class:span-8={meta.span === 8}
	style={dragging ? dragStyle : undefined}
	data-widget={widget.type}
	data-type={widget.type}
	data-widget-index={index}
	bind:this={card}
	aria-labelledby={`widget-title-${widget.type}`}
>
	<header class="widget-head">
		<button
			type="button"
			class="drag-handle"
			aria-label={`Перетащить виджет «${meta.title}». Стрелки вверх и вниз меняют порядок.`}
			title="Перетащить"
			onpointerdown={(event) => onDragStart(event, card)}
			onkeydown={handleKeydown}
		>
			<Icon name="grip" size={15} />
		</button>

		<div class="widget-title-wrap">
			<span class="widget-icon" aria-hidden="true">
				<Icon name={meta.icon} size={17} />
			</span>
			<div class="widget-title">
				<h2 id={`widget-title-${widget.type}`}>{meta.title}</h2>
			</div>
		</div>

		<div class="widget-actions">
			<details class="widget-menu" bind:this={menu}>
				<summary class="icon-btn" aria-label={`Действия с виджетом «${meta.title}»`} title="Действия">
					<Icon name="menu" size={16} />
				</summary>
				<div class="menu-panel">
					<p class="mono menu-caption">{meta.kicker}</p>
					<button type="button" disabled={index === 0} onclick={() => move(-1)}>
						<Icon name="arrow-up" size={14} />
						<span>Переместить выше</span>
					</button>
					<button type="button" disabled={index === total - 1} onclick={() => move(1)}>
						<Icon name="arrow-down" size={14} />
						<span>Переместить ниже</span>
					</button>
					<button type="button" class="danger" onclick={remove}>
						<Icon name="trash" size={14} />
						<span>Удалить виджет</span>
					</button>
				</div>
			</details>
		</div>
	</header>

	<div class="widget-body">
		{@render children()}
	</div>
</article>

<style>
	.widget {
		position: relative;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		width: 100%;
		min-width: 0;
		margin-bottom: 1rem;
		break-inside: avoid;
		-webkit-column-break-inside: avoid;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--panel);
		box-shadow:
			0 1px 1px rgba(16, 19, 24, 0.03),
			0 5px 12px -6px rgba(16, 19, 24, 0.1),
			0 20px 42px -20px rgba(16, 19, 24, 0.2);
		transition: box-shadow 200ms ease;
	}

	.widget:hover {
		box-shadow:
			0 1px 1px rgba(16, 19, 24, 0.04),
			0 7px 16px -7px rgba(16, 19, 24, 0.13),
			0 26px 54px -22px rgba(16, 19, 24, 0.24);
	}

	.widget:has(.widget-menu[open]) {
		z-index: 30;
	}

	.widget.dragging {
		position: fixed;
		z-index: 60;
		margin: 0;
		pointer-events: none;
		transform: rotate(0.6deg);
		box-shadow:
			0 2px 6px rgba(16, 19, 24, 0.1),
			0 28px 64px -18px rgba(16, 19, 24, 0.38);
		transition: none;
		break-inside: auto;
	}

	.widget-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.55rem;
		padding: 0.9rem 1.1rem;
		border-bottom: 1px solid var(--line);
	}

	.drag-handle {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		margin-left: -0.55rem;
		flex-shrink: 0;
		border-radius: 0.4rem;
		color: var(--faint);
		cursor: grab;
		touch-action: none;
		transition:
			color 150ms ease,
			background-color 150ms ease;
	}

	.drag-handle:hover {
		color: var(--ink);
		background: var(--panel-2);
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.widget-title-wrap {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		min-width: 0;
		flex: 1;
	}

	.widget-icon {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		flex-shrink: 0;
		border-radius: var(--radius);
		color: var(--blue);
		background: var(--blue-soft);
	}

	.widget-title {
		min-width: 0;
	}

	.widget-title h2 {
		font-size: 1rem;
		font-weight: 650;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	.widget-actions {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		flex-shrink: 0;
	}

	.widget-body {
		padding: 1.1rem;
		flex: 1;
		min-height: 0;
	}

	.widget-menu {
		position: relative;
	}

	.widget-menu summary {
		list-style: none;
		cursor: pointer;
	}

	.widget-menu summary::-webkit-details-marker {
		display: none;
	}

	.menu-panel {
		position: absolute;
		top: calc(100% + 0.35rem);
		right: 0;
		z-index: 40;
		display: grid;
		min-width: 13rem;
		padding: 0.35rem;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius);
		background: var(--panel);
		box-shadow: 0 14px 36px rgba(16, 19, 24, 0.12);
	}

	.menu-caption {
		padding: 0.35rem 0.45rem 0.4rem;
		color: var(--faint);
		font-size: 0.56rem;
		border-bottom: 1px solid var(--line);
	}

	.menu-panel button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 0.45rem;
		color: var(--ink);
		font-size: 0.72rem;
		text-align: left;
		transition: background-color var(--dur-fast) var(--ease-out);
	}

	.menu-panel button:hover:not(:disabled) {
		background: var(--blue-soft);
	}

	.menu-panel button:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.menu-panel button.danger {
		color: var(--red);
	}

	@media (max-width: 820px) {
		.widget-head {
			padding: 0.85rem;
		}

		.widget-body {
			padding: 0.9rem;
		}
	}
</style>
