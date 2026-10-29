import {
	DEMO_TASKS,
	type Task,
	type TaskFilter,
	type TaskPriority
} from "$lib/content";
import { uid } from "$lib/core/format";
import { Widget } from "../widget.svelte";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function normalizeTask(value: unknown): Task | null {
	if (!isRecord(value)) return null;
	if (typeof value.id !== "string" || typeof value.title !== "string") return null;
	const priority: TaskPriority =
		value.priority === "high" || value.priority === "low" ? value.priority : "normal";
	return {
		id: value.id,
		title: value.title,
		done: Boolean(value.done),
		priority,
		...(typeof value.dueInDays === "number" ? { dueInDays: value.dueInDays } : {}),
		...(typeof value.dueDate === "string" ? { dueDate: value.dueDate } : {}),
		createdAt: typeof value.createdAt === "string" ? value.createdAt : new Date().toISOString(),
		...(value.demo ? { demo: true } : {})
	};
}

export class TodoWidget extends Widget {
	readonly type = "todo" as const;
	tasks = $state<Task[]>([]);
	filter = $state<TaskFilter>("all");

	constructor(onChange: () => void) {
		super(onChange);
		this.tasks = structuredClone(DEMO_TASKS);
	}

	get total(): number {
		return this.tasks.length;
	}

	get doneCount(): number {
		return this.tasks.filter((task) => task.done).length;
	}

	get progress(): number {
		if (this.total === 0) return 0;
		return Math.round((this.doneCount / this.total) * 100);
	}

	get visibleTasks(): Task[] {
		if (this.filter === "active") return this.tasks.filter((task) => !task.done);
		if (this.filter === "done") return this.tasks.filter((task) => task.done);
		return this.tasks;
	}

	addTask(title: string, priority: TaskPriority, dueDate: string): boolean {
		const trimmed = title.trim();
		if (!trimmed) return false;
		this.tasks.push({
			id: uid("task"),
			title: trimmed,
			done: false,
			priority,
			...(dueDate ? { dueDate } : {}),
			createdAt: new Date().toISOString()
		});
		this.requestSave();
		return true;
	}

	toggleTask(id: string): void {
		const task = this.tasks.find((entry) => entry.id === id);
		if (!task) return;
		task.done = !task.done;
		this.requestSave();
	}

	removeTask(id: string): void {
		const index = this.tasks.findIndex((task) => task.id === id);
		if (index < 0) return;
		this.tasks.splice(index, 1);
		this.requestSave();
	}

	moveTask(id: string, targetId: string): void {
		if (id === targetId) return;
		const from = this.tasks.findIndex((task) => task.id === id);
		const to = this.tasks.findIndex((task) => task.id === targetId);
		if (from < 0 || to < 0) return;
		const [task] = this.tasks.splice(from, 1);
		if (!task) return;
		this.tasks.splice(to, 0, task);
		this.requestSave();
	}

	moveTaskBy(id: string, direction: -1 | 1): void {
		const index = this.tasks.findIndex((task) => task.id === id);
		const next = index + direction;
		if (index < 0 || next < 0 || next >= this.tasks.length) return;
		const [task] = this.tasks.splice(index, 1);
		if (!task) return;
		this.tasks.splice(next, 0, task);
		this.requestSave();
	}

	setFilter(filter: TaskFilter): void {
		this.filter = filter;
		this.requestSave();
	}

	clearDone(): void {
		const remaining = this.tasks.filter((task) => !task.done);
		if (remaining.length === this.tasks.length) return;
		this.tasks = remaining;
		this.requestSave();
	}

	serialize(): unknown {
		return {
			tasks: this.tasks.map((task) => ({ ...task })),
			filter: this.filter
		};
	}

	override hydrate(data: unknown): void {
		if (!isRecord(data)) return;
		if (Array.isArray(data.tasks)) {
			this.tasks = data.tasks.map(normalizeTask).filter((task): task is Task => task !== null);
		}
		if (data.filter === "all" || data.filter === "active" || data.filter === "done") {
			this.filter = data.filter;
		}
	}
}
