<script lang="ts">
	import { onMount } from "svelte";
	import Header from "$lib/components/Header.svelte";
	import Icon from "$lib/components/Icon.svelte";
	import Modal from "$lib/components/Modal.svelte";
	import SiteFooter from "$lib/components/SiteFooter.svelte";
	import WidgetFrame from "$lib/components/WidgetFrame.svelte";
	import WidgetGallery from "$lib/components/WidgetGallery.svelte";
	import WidgetView from "$lib/components/WidgetView.svelte";
	import type { WidgetType } from "$lib/content";
	import { Dashboard } from "$lib/state/dashboard.svelte";

	interface DragState {
		type: WidgetType;
		index: number;
		left: number;
		top: number;
		width: number;
		height: number;
		offsetX: number;
		offsetY: number;
		x: number;
		y: number;
		dropIndex: number;
	}

	const dashboard = new Dashboard();
	let galleryOpen = $state(false);
	let resetOpen = $state(false);
	let drag = $state<DragState | null>(null);
	let rafId = 0;

	onMount(() => {
		dashboard.init();
		return () => {
			dashboard.destroy();
			stopDragging();
		};
	});

	function resetDashboard(): void {
		dashboard.reset();
		resetOpen = false;
	}

	function dropIndexAt(x: number, y: number): number {
		if (!drag) return 0;
		const element = document.elementFromPoint(x, y);
		if (!element) return drag.dropIndex;
		// Hovering the preview slot keeps the current target: the slot itself
		// shifts the cards, so measuring them again would cause flicker.
		if (element.closest(".drop-slot")) return drag.dropIndex;
		const card = element.closest<HTMLElement>("[data-widget-index]");
		if (!card || card.classList.contains("dragging")) return drag.dropIndex;
		const rect = card.getBoundingClientRect();
		const position = Number(card.dataset.widgetIndex);
		return y < rect.top + rect.height / 2 ? position : position + 1;
	}

	function startDragging(event: PointerEvent, card: HTMLElement | undefined): void {
		if (drag || !card) return;
		if (event.pointerType === "mouse" && event.button !== 0) return;
		const type = card.dataset.widget as WidgetType | undefined;
		const index = Number(card.dataset.widgetIndex);
		if (!type || Number.isNaN(index)) return;

		event.preventDefault();
		const rect = card.getBoundingClientRect();
		drag = {
			type,
			index,
			left: rect.left,
			top: rect.top,
			width: rect.width,
			height: rect.height,
			offsetX: event.clientX - rect.left,
			offsetY: event.clientY - rect.top,
			x: event.clientX,
			y: event.clientY,
			dropIndex: index
		};
		document.body.classList.add("is-dragging-widget");
		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", finishDragging);
		window.addEventListener("pointercancel", cancelDragging);
		window.addEventListener("keydown", handleKeydown);
		rafId = requestAnimationFrame(autoScroll);
	}

	function handlePointerMove(event: PointerEvent): void {
		if (!drag) return;
		drag.x = event.clientX;
		drag.y = event.clientY;
		const maxLeft = document.documentElement.clientWidth - drag.width - 4;
		drag.left = Math.min(Math.max(event.clientX - drag.offsetX, 4), Math.max(4, maxLeft));
		drag.top = event.clientY - drag.offsetY;
		drag.dropIndex = dropIndexAt(event.clientX, event.clientY);
	}

	function autoScroll(): void {
		if (!drag) return;
		const edge = 90;
		const y = drag.y;
		let delta = 0;
		if (y < edge) delta = -Math.ceil((edge - y) / 5);
		else if (y > window.innerHeight - edge) delta = Math.ceil((y - (window.innerHeight - edge)) / 5);

		if (delta !== 0) {
			window.scrollBy(0, delta);
			drag.top = y - drag.offsetY;
			drag.dropIndex = dropIndexAt(drag.x, drag.y);
		}
		rafId = requestAnimationFrame(autoScroll);
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === "Escape") {
			event.preventDefault();
			cancelDragging();
		}
	}

	function stopDragging(): void {
		window.removeEventListener("pointermove", handlePointerMove);
		window.removeEventListener("pointerup", finishDragging);
		window.removeEventListener("pointercancel", cancelDragging);
		window.removeEventListener("keydown", handleKeydown);
		cancelAnimationFrame(rafId);
		document.body.classList.remove("is-dragging-widget");
		drag = null;
	}

	function finishDragging(): void {
		if (!drag) return;
		const { type, index, dropIndex } = drag;
		const target = dropIndex > index ? dropIndex - 1 : dropIndex;
		stopDragging();
		if (target !== index) dashboard.moveTo(type, target);
	}

	function cancelDragging(): void {
		stopDragging();
	}
</script>

<a class="skip-link" href="#dashboard">К панели</a>

<Header
	widgetCount={dashboard.count}
	storageNotice={dashboard.storageNotice}
	onAdd={() => (galleryOpen = true)}
	onReset={() => (resetOpen = true)}
/>

<main id="main">
	<section class="dashboard-section" id="dashboard" aria-labelledby="dashboard-title">
		<div class="container">
			<div class="dashboard-head">
				<h1 id="dashboard-title">Городской штаб</h1>
				<p>
					Погода, дела, деньги и прогулка по центру. Всё, что нужно для дня в Петербурге,
					на одном экране.
				</p>
			</div>

			<div class="widget-grid">
				{#each dashboard.widgets as widget, index (widget.type + "-" + dashboard.generation)}
					{#if drag && drag.dropIndex === index}
						{@render dropSlot(drag.height)}
					{/if}
					<WidgetFrame
						{widget}
						{index}
						total={dashboard.count}
						dragging={drag?.type === widget.type}
						dragStyle={drag?.type === widget.type
							? `left:${drag.left}px;top:${drag.top}px;width:${drag.width}px;`
							: undefined}
						onMove={(direction) => dashboard.move(widget.type, direction)}
						onRemove={() => dashboard.remove(widget.type)}
						onDragStart={(event, card) => startDragging(event, card)}
					>
						<WidgetView {widget} />
					</WidgetFrame>
				{/each}
				{#if drag && drag.dropIndex === dashboard.widgets.length}
					{@render dropSlot(drag.height)}
				{/if}
			</div>

			{#if dashboard.widgets.length === 0}
				<div class="empty-panel">
					<Icon name="layers" size={26} />
					<div>
						<h2>Панель пуста</h2>
						<p>Добавьте виджеты из галереи — набор сохранится в браузере.</p>
					</div>
					<button type="button" class="btn btn-primary" onclick={() => (galleryOpen = true)}>
						<Icon name="plus" size={15} />
						Добавить
					</button>
				</div>
			{/if}
		</div>
	</section>
</main>

{#snippet dropSlot(height: number)}
	<div class="drop-slot" style:height={`${height}px`} aria-hidden="true">
		<span class="drop-slot-label">Отпустите здесь</span>
	</div>
{/snippet}

<SiteFooter />

<WidgetGallery bind:open={galleryOpen} {dashboard} />

<Modal
	bind:open={resetOpen}
	title="Сбросить панель?"
	description="Вернутся шесть демонстрационных виджетов и исходные демо-данные."
>
	<p class="reset-copy">
		Ваши задачи, заметки и расходы будут удалены. Погода и валюты загрузятся заново.
	</p>

	{#snippet footer()}
		<button type="button" class="btn btn-ghost" onclick={() => (resetOpen = false)}>Отмена</button>
		<button type="button" class="btn btn-danger" onclick={resetDashboard}>Сбросить</button>
	{/snippet}
</Modal>

<style>
	:global(body.is-dragging-widget) {
		user-select: none;
		cursor: grabbing;
	}

	.dashboard-section {
		padding-block: 2.5rem 4rem;
		scroll-margin-top: 5rem;
	}

	.dashboard-head {
		max-width: 44rem;
		margin-bottom: 1.5rem;
	}

	.dashboard-head h1 {
		font-size: clamp(2.2rem, 5vw, 3.6rem);
		letter-spacing: -0.05em;
	}

	.dashboard-head p {
		margin-top: 0.6rem;
		color: var(--muted);
		font-size: 1rem;
		line-height: 1.5;
	}

	.widget-grid {
		columns: 2;
		column-gap: 1rem;
	}

	.drop-slot {
		display: grid;
		place-items: center;
		width: 100%;
		margin-bottom: 1rem;
		border: 1.5px dashed var(--blue);
		border-radius: var(--radius);
		background: var(--blue-soft);
		break-inside: avoid;
		-webkit-column-break-inside: avoid;
	}

	.drop-slot-label {
		color: var(--blue);
		font-family: var(--f-mono);
		font-size: 0.62rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.empty-panel {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem;
		border: 1px dashed var(--line-strong);
		border-radius: var(--radius);
		background: var(--panel);
	}

	.empty-panel > div {
		flex: 1;
	}

	.empty-panel h2 {
		font-size: 1.1rem;
	}

	.empty-panel p {
		margin-top: 0.15rem;
		color: var(--muted);
		font-size: 0.85rem;
	}

	.reset-copy {
		color: var(--muted);
		font-size: 0.9rem;
		line-height: 1.55;
	}

	@media (max-width: 820px) {
		.widget-grid {
			columns: 1;
		}

		.dashboard-section {
			padding-block: 1.75rem 3rem;
		}

		.empty-panel {
			flex-wrap: wrap;
		}
	}
</style>
