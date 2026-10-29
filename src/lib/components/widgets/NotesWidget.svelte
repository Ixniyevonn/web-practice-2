<script lang="ts">
	import {
		formatDateShort,
		formatRelativeDays
	} from "$lib/core/format";
	import type { Note } from "$lib/content";
	import type { NotesWidget } from "$lib/state/widgets/notes.svelte";
	import Icon from "../Icon.svelte";
	import Modal from "../Modal.svelte";

	let { widget }: { widget: NotesWidget } = $props();

	let noteOpen = $state(false);
	let noteTitle = $state("");
	let notePlace = $state("");
	let noteText = $state("");
	let formError = $state("");

	function noteDate(note: Note): string {
		if (typeof note.daysAgo === "number") return formatRelativeDays(note.daysAgo);
		if (note.createdAt) return formatDateShort(new Date(note.createdAt));
		return "без даты";
	}

	function openForm(): void {
		noteTitle = "";
		notePlace = "";
		noteText = "";
		formError = "";
		noteOpen = true;
	}

	function saveNote(event: SubmitEvent): void {
		event.preventDefault();
		formError = "";
		if (!noteTitle.trim()) {
			formError = "Введите заголовок записи.";
			return;
		}
		if (!noteText.trim()) {
			formError = "Добавьте хотя бы несколько слов.";
			return;
		}
		if (!widget.addNote(noteTitle, noteText, notePlace)) {
			formError = "Не удалось сохранить запись.";
			return;
		}
		noteOpen = false;
	}
</script>

<div class="notes">
	<div class="notes-head">
		<span class="notes-count">{widget.notes.length} записи</span>
		<button type="button" class="add-note" onclick={openForm}>
			<Icon name="plus" size={15} />
			Новая запись
		</button>
	</div>

	{#if widget.sortedNotes.length === 0}
		<div class="empty-state">
			<Icon name="note" size={26} />
			<p>Журнал пуст. Запишите первое наблюдение о городе — оно сохранится в браузере.</p>
		</div>
	{:else}
		<ul class="notes-list">
			{#each widget.sortedNotes as note (note.id)}
				<li class="note">
					<div class="note-top">
						<div class="note-heading">
							<h3>{note.title}</h3>
							<span class="note-meta">
								{#if note.place}<span>{note.place}</span>{/if}
								<span>{noteDate(note)}</span>
							</span>
						</div>
						<button
							type="button"
							class="note-delete"
							aria-label={`Удалить запись «${note.title}»`}
							title="Удалить запись"
							onclick={() => widget.removeNote(note.id)}
						>
							<Icon name="close" size={13} />
						</button>
					</div>
					<p class="note-text">{note.text}</p>
				</li>
			{/each}
		</ul>
	{/if}

	<div class="notes-foot">Записи хранятся только в этом браузере</div>
</div>

<Modal
	bind:open={noteOpen}
	title="Новая запись"
	description="Короткое наблюдение о городе, месте или планах. Текст сохранится в localStorage."
>
	<form id="note-form" class="note-form" onsubmit={saveNote}>
		<label class="field">
			<span class="mono">ЗАГОЛОВОК</span>
			<input
				type="text"
				bind:value={noteTitle}
				placeholder="Например, свет на Фонтанке"
				maxlength="90"
				autocomplete="off"
			/>
		</label>
		<label class="field">
			<span class="mono">МЕСТО</span>
			<input
				type="text"
				bind:value={notePlace}
				placeholder="Необязательно"
				maxlength="80"
				autocomplete="off"
			/>
		</label>
		<label class="field">
			<span class="mono">ТЕКСТ</span>
			<textarea
				bind:value={noteText}
				rows="6"
				placeholder="Что заметили?"
				maxlength="1200"
			></textarea>
		</label>
		{#if formError}
			<p class="form-error" role="alert">{formError}</p>
		{/if}
	</form>

	{#snippet footer()}
		<button type="button" class="btn btn-ghost" onclick={() => (noteOpen = false)}>Отмена</button>
		<button type="submit" form="note-form" class="btn btn-primary">Сохранить</button>
	{/snippet}
</Modal>

<style>
	.notes {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	.notes-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
	}

	.notes-count {
		color: var(--muted);
		font-size: 0.8rem;
	}

	.add-note {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		flex-shrink: 0;
		padding: 0.45rem 0.65rem;
		border: 1px solid var(--blue-line);
		border-radius: var(--radius);
		color: var(--blue);
		font-size: 0.8rem;
		transition: background-color 150ms ease;
	}

	.add-note:hover {
		background: var(--blue-soft);
	}

	.notes-list {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.65rem;
	}

	.note {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.9rem;
		border: 1px solid var(--line);
		border-radius: var(--radius);
	}

	.note-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.4rem;
	}

	.note-heading {
		min-width: 0;
	}

	.note-heading h3 {
		font-size: 0.92rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.note-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem 0.45rem;
		margin-top: 0.2rem;
		color: var(--faint);
		font-size: 0.72rem;
	}

	.note-meta > span + span::before {
		content: "·";
		margin-right: 0.4rem;
	}

	.note-delete {
		display: grid;
		place-items: center;
		width: 1.6rem;
		height: 1.6rem;
		flex-shrink: 0;
		border-radius: var(--radius);
		color: var(--faint);
	}

	.note-delete:hover {
		background: var(--red-soft);
		color: var(--red);
	}

	.note-text {
		margin: 0;
		color: var(--muted);
		font-size: 0.82rem;
		line-height: 1.5;
	}

	.empty-state {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		padding: 1rem 0.2rem;
		color: var(--muted);
		font-size: 0.85rem;
		line-height: 1.45;
	}

	.empty-state p {
		margin: 0;
	}

	.notes-foot {
		margin-top: auto;
		padding-top: 0.6rem;
		border-top: 1px solid var(--line);
		color: var(--faint);
		font-size: 0.7rem;
	}

	@media (max-width: 900px) {
		.notes-list {
			grid-template-columns: 1fr;
		}
	}

	.note-form {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field > span {
		color: var(--faint);
		font-size: 0.56rem;
	}

	.field input,
	.field textarea {
		width: 100%;
		padding: 0.55rem 0.6rem;
		border: 1px solid var(--line-strong);
		background: var(--bg);
		font-size: 0.82rem;
		line-height: 1.45;
		resize: vertical;
	}

	.field input {
		height: 2.35rem;
	}

	.form-error {
		margin: 0;
		color: var(--red);
		font-size: 0.68rem;
	}

	@media (max-width: 720px) {
		.notes {
			min-height: 0;
		}

		.notes-list {
			max-height: 28rem;
		}

		.note-delete {
			opacity: 1;
		}
	}
</style>
