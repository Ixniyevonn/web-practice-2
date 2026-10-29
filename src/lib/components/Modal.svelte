<script lang="ts">
	import type { Snippet } from "svelte";
	import Icon from "./Icon.svelte";

	let {
		open = $bindable(false),
		title,
		description = "",
		wide = false,
		children,
		footer
	}: {
		open?: boolean;
		title: string;
		description?: string;
		wide?: boolean;
		children: Snippet;
		footer?: Snippet;
	} = $props();

	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});

	function close(): void {
		open = false;
	}

	function handleCancel(event: Event): void {
		event.preventDefault();
		close();
	}

	function handleClick(event: MouseEvent): void {
		if (event.target === dialog) close();
	}
</script>

<dialog
	bind:this={dialog}
	class:wide
	class="modal"
	aria-label={title}
	onclose={() => (open = false)}
	oncancel={handleCancel}
	onclick={handleClick}
>
	<header class="modal-head">
		<div>
			<h2>{title}</h2>
			{#if description}
				<p class="modal-description">{description}</p>
			{/if}
		</div>
		<button type="button" class="icon-btn" aria-label="Закрыть" onclick={close}>
			<Icon name="close" size={18} />
		</button>
	</header>

	<div class="modal-body">
		{@render children()}
	</div>

	{#if footer}
		<footer class="modal-footer">
			{@render footer()}
		</footer>
	{/if}
</dialog>

<style>
	.modal {
		width: min(100% - 2rem, 34rem);
		max-height: min(88svh, 54rem);
		margin: auto;
		padding: 0;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius);
		background: var(--panel);
		color: var(--ink);
		box-shadow: 0 30px 90px rgba(16, 19, 24, 0.18);
	}

	.modal.wide {
		width: min(100% - 2rem, 58rem);
	}

	.modal::backdrop {
		background: rgba(16, 19, 24, 0.38);
		backdrop-filter: blur(3px);
	}

	.modal-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.3rem 1.3rem 1rem;
		border-bottom: 1px solid var(--line);
	}

	h2 {
		font-size: clamp(1.3rem, 3vw, 1.7rem);
		letter-spacing: -0.03em;
	}

	.modal-description {
		max-width: 46ch;
		margin-top: 0.55rem;
		color: var(--muted);
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.modal-body {
		max-height: 62svh;
		padding: 1.3rem;
		overflow: auto;
	}

	.modal-footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.6rem;
		padding: 0.9rem 1.3rem;
		border-top: 1px solid var(--line);
		background: var(--panel-2);
	}

	@media (max-width: 640px) {
		.modal,
		.modal.wide {
			width: 100%;
			max-height: 92svh;
			margin: auto 0 0;
			border-left: 0;
			border-right: 0;
			border-bottom: 0;
		}

		.modal-head,
		.modal-body,
		.modal-footer {
			padding-left: 1rem;
			padding-right: 1rem;
		}

		.modal-body {
			max-height: 66svh;
		}
	}
</style>
