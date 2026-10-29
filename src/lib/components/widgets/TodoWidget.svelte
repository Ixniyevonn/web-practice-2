<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { TASK_PRIORITIES, type Task, type TaskPriority } from "$lib/content";
	import { deadlineTone, formatDeadline, todayISO } from "$lib/core/format";
	import type { TodoWidget } from "$lib/state/widgets/todo.svelte";
	import Icon from "../Icon.svelte";

	let { widget }: { widget: TodoWidget } = $props();

	let newTitle = $state("");
	let newPriority = $state<TaskPriority>("normal");
	let newDeadline = $state("");
	let formError = $state("");
	let minDate = $state("");
	let draggingId = $state<string | null>(null);
	let dragOverId = $state<string | null>(null);
	let dragCleanup: (() => void) | null = null;

	onMount(() => {
		minDate = todayISO();
	});

	function priorityLabel(priority: TaskPriority): string {
		return TASK_PRIORITIES.find((entry) => entry.id === priority)?.label ?? "Обычно";
	}

	function addTask(event: SubmitEvent): void {
		event.preventDefault();
		formError = "";
		if (!newTitle.trim()) {
			formError = "Введите название задачи.";
			return;
		}
		if (!widget.addTask(newTitle, newPriority, newDeadline)) {
			formError = "Не удалось добавить задачу.";
			return;
		}
		newTitle = "";
		newDeadline = "";
		newPriority = "normal";
	}

	function startDrag(event: PointerEvent, task: Task): void {
		if (event.pointerType === "mouse" && event.button !== 0) return;
		event.preventDefault();
		draggingId = task.id;

		const onMove = (moveEvent: PointerEvent) => {
			const target = document
				.elementFromPoint(moveEvent.clientX, moveEvent.clientY)
				?.closest<HTMLElement>("[data-task-id]");
			const overId = target?.dataset.taskId;
			if (!overId || overId === task.id) return;
			dragOverId = overId;
			widget.moveTask(task.id, overId);
		};

		const finish = () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", finish);
			window.removeEventListener("pointercancel", finish);
			draggingId = null;
			dragOverId = null;
			dragCleanup = null;
		};

		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", finish);
		window.addEventListener("pointercancel", finish);
		dragCleanup = () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", finish);
			window.removeEventListener("pointercancel", finish);
		};
	}

	function dragKeydown(event: KeyboardEvent, task: Task): void {
		if (event.key === "ArrowUp") {
			event.preventDefault();
			widget.moveTaskBy(task.id, -1);
		}
		if (event.key === "ArrowDown") {
			event.preventDefault();
			widget.moveTaskBy(task.id, 1);
		}
	}

	onDestroy(() => dragCleanup?.());
</script>

<div class="todo">
	<div class="summary">
		<span>{widget.doneCount} из {widget.total}</span>
		<div
			class="progress"
			role="progressbar"
			aria-label="Прогресс задач"
			aria-valuemin="0"
			aria-valuemax="100"
			aria-valuenow={widget.progress}
		>
			<span style:width={`${widget.progress}%`}></span>
		</div>
	</div>

	<form class="add-form" onsubmit={addTask}>
		<label class="sr-only" for="todo-title">Новая задача</label>
		<input
			id="todo-title"
			type="text"
			bind:value={newTitle}
			placeholder="Новая задача"
			maxlength="120"
			autocomplete="off"
		/>
		<label class="sr-only" for="todo-priority">Приоритет</label>
		<select id="todo-priority" bind:value={newPriority} title="Приоритет">
			{#each TASK_PRIORITIES as priority}
				<option value={priority.id}>{priority.label}</option>
			{/each}
		</select>
		<label class="sr-only" for="todo-deadline">Срок</label>
		<input id="todo-deadline" type="date" bind:value={newDeadline} min={minDate} title="Срок" />
		<button type="submit" class="add-button" aria-label="Добавить задачу">
			<Icon name="plus" size={16} />
		</button>
		{#if formError}
			<p class="error" role="alert">{formError}</p>
		{/if}
	</form>

	<ul class="tasks">
		{#each widget.tasks as task (task.id)}
			<li
				class:done={task.done}
				class:dragging={draggingId === task.id}
				class:drag-over={dragOverId === task.id}
				data-task-id={task.id}
			>
				<button
					type="button"
					class="handle"
					aria-label={`Переместить задачу «${task.title}»`}
					title="Перетащите или используйте стрелки"
					onpointerdown={(event) => startDrag(event, task)}
					onkeydown={(event) => dragKeydown(event, task)}
				>
					<Icon name="grip" size={14} />
				</button>

				<button
					type="button"
					class="check"
					role="checkbox"
					aria-checked={task.done}
					aria-label={task.done ? `Вернуть задачу «${task.title}»` : `Отметить «${task.title}»`}
					onclick={() => widget.toggleTask(task.id)}
				>
					{#if task.done}<Icon name="check" size={12} />{/if}
				</button>

				<div class="task-main">
					<span class="task-title">{task.title}</span>
					<span class="task-meta">
						<span data-priority={task.priority}>{priorityLabel(task.priority)}</span>
						<span data-tone={deadlineTone(task.dueInDays, task.dueDate)}>
							{formatDeadline(task.dueInDays, task.dueDate)}
						</span>
					</span>
				</div>

				<button
					type="button"
					class="delete"
					aria-label={`Удалить задачу «${task.title}»`}
					title="Удалить"
					onclick={() => widget.removeTask(task.id)}
				>
					<Icon name="close" size={14} />
				</button>
			</li>
		{/each}
	</ul>

	<div class="foot">Перетащите задачу за ручку, чтобы изменить порядок</div>
</div>

<style>
	.todo {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.summary {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		color: var(--muted);
		font-size: 0.78rem;
	}

	.summary > span {
		flex-shrink: 0;
	}

	.progress {
		flex: 1;
		height: 0.4rem;
		border-radius: 999px;
		background: var(--line);
		overflow: hidden;
	}

	.progress span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: var(--blue);
		transition: width 200ms ease;
	}

	.add-form {
		display: grid;
		grid-template-columns: 1fr 5.5rem 7.5rem auto;
		gap: 0.3rem;
	}

	.add-form input,
	.add-form select {
		height: 2.2rem;
		padding: 0 0.5rem;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--bg);
		font-size: 0.8rem;
	}

	.add-form select {
		font-size: 0.75rem;
	}

	.add-button {
		display: grid;
		place-items: center;
		width: 2.2rem;
		height: 2.2rem;
		border-radius: var(--radius);
		background: var(--ink);
		color: #fff;
	}

	.add-button:hover {
		background: var(--blue);
	}

	.error {
		grid-column: 1 / -1;
		margin: 0;
		color: var(--red);
		font-size: 0.75rem;
	}

	.tasks {
		display: flex;
		flex-direction: column;
	}

	.tasks li {
		display: flex;
		align-items: flex-start;
		gap: 0.4rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--line);
	}

	.tasks li:last-child {
		border-bottom: 0;
	}

	.tasks li.dragging {
		opacity: 0.45;
	}

	.tasks li.drag-over {
		background: var(--blue-soft);
	}

	.handle {
		display: grid;
		place-items: center;
		width: 1.2rem;
		height: 1.6rem;
		flex-shrink: 0;
		color: var(--faint);
		cursor: grab;
		touch-action: none;
	}

	.handle:hover {
		color: var(--blue);
	}

	.check {
		display: grid;
		place-items: center;
		width: 1.1rem;
		height: 1.1rem;
		flex-shrink: 0;
		margin-top: 0.12rem;
		border: 1px solid var(--line-strong);
		border-radius: 999px;
		color: #fff;
	}

	.done .check {
		background: var(--blue);
		border-color: var(--blue);
	}

	.task-main {
		flex: 1;
		min-width: 0;
	}

	.task-title {
		display: block;
		font-size: 0.85rem;
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.done .task-title {
		color: var(--faint);
		text-decoration: line-through;
	}

	.task-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 0.7rem;
		margin-top: 0.15rem;
		color: var(--faint);
		font-size: 0.7rem;
	}

	.task-meta [data-priority="high"] {
		color: var(--red);
	}

	.task-meta [data-priority="normal"] {
		color: var(--blue);
	}

	.task-meta [data-tone="danger"] {
		color: var(--red);
	}

	.task-meta [data-tone="warning"] {
		color: var(--amber);
	}

	.delete {
		display: grid;
		place-items: center;
		width: 1.8rem;
		height: 1.8rem;
		flex-shrink: 0;
		border-radius: var(--radius);
		color: var(--faint);
	}

	.delete:hover {
		background: var(--red-soft);
		color: var(--red);
	}

	.foot {
		color: var(--faint);
		font-size: 0.7rem;
	}

	@media (max-width: 620px) {
		.add-form {
			grid-template-columns: 1fr auto;
		}

		.add-form select,
		.add-form input[type="date"] {
			grid-row: 2;
		}

		.add-form select {
			grid-column: 1;
		}

		.add-form input[type="date"] {
			grid-column: 2;
		}

		.add-button {
			grid-column: 2;
			grid-row: 1;
		}

		.add-form input[type="text"] {
			grid-column: 1;
			grid-row: 1;
		}
	}
</style>
