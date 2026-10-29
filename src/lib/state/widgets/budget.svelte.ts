import {
	BUDGET_CATEGORIES,
	DEMO_BUDGET_LIMIT,
	DEMO_EXPENSES,
	type BudgetCategoryId,
	type BudgetExpense
} from "$lib/content";
import { clamp, uid } from "$lib/core/format";
import { Widget } from "../widget.svelte";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function normalizeExpense(value: unknown): BudgetExpense | null {
	if (!isRecord(value)) return null;
	if (typeof value.id !== "string" || typeof value.title !== "string") return null;
	if (typeof value.amount !== "number" || !Number.isFinite(value.amount)) return null;
	const category = BUDGET_CATEGORIES.some((entry) => entry.id === value.category)
		? (value.category as BudgetCategoryId)
		: "other";
	return {
		id: value.id,
		title: value.title,
		amount: Math.max(0, value.amount),
		category,
		...(typeof value.daysAgo === "number" ? { daysAgo: value.daysAgo } : {}),
		...(typeof value.createdAt === "string" ? { createdAt: value.createdAt } : {}),
		...(value.demo ? { demo: true } : {})
	};
}

export class BudgetWidget extends Widget {
	readonly type = "budget" as const;
	limit = $state(DEMO_BUDGET_LIMIT);
	expenses = $state<BudgetExpense[]>([]);

	constructor(onChange: () => void) {
		super(onChange);
		this.expenses = structuredClone(DEMO_EXPENSES);
	}

	get total(): number {
		return this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
	}

	get remaining(): number {
		return this.limit - this.total;
	}

	get progress(): number {
		if (this.limit <= 0) return 100;
		return clamp((this.total / this.limit) * 100, 0, 100);
	}

	get byCategory(): { id: BudgetCategoryId; label: string; color: string; total: number }[] {
		return BUDGET_CATEGORIES.map((category) => ({
			id: category.id,
			label: category.label,
			color: category.color,
			total: this.expenses
				.filter((expense) => expense.category === category.id)
				.reduce((sum, expense) => sum + expense.amount, 0)
		}));
	}

	addExpense(title: string, amount: number, category: BudgetCategoryId): boolean {
		const trimmed = title.trim();
		if (!trimmed || !Number.isFinite(amount) || amount <= 0) return false;
		this.expenses.unshift({
			id: uid("expense"),
			title: trimmed,
			amount: Math.round(amount),
			category,
			createdAt: new Date().toISOString()
		});
		this.requestSave();
		return true;
	}

	removeExpense(id: string): void {
		const index = this.expenses.findIndex((expense) => expense.id === id);
		if (index < 0) return;
		this.expenses.splice(index, 1);
		this.requestSave();
	}

	setLimit(value: number): void {
		if (!Number.isFinite(value)) return;
		this.limit = Math.max(0, Math.round(value));
		this.requestSave();
	}

	serialize(): unknown {
		return {
			limit: this.limit,
			expenses: this.expenses.map((expense) => ({ ...expense }))
		};
	}

	override hydrate(data: unknown): void {
		if (!isRecord(data)) return;
		if (typeof data.limit === "number" && Number.isFinite(data.limit)) {
			this.limit = Math.max(0, Math.round(data.limit));
		}
		if (Array.isArray(data.expenses)) {
			this.expenses = data.expenses
				.map(normalizeExpense)
				.filter((expense): expense is BudgetExpense => expense !== null);
		}
	}
}
