<script lang="ts">
	import { BUDGET_CATEGORIES, type BudgetCategoryId } from "$lib/content";
	import { formatDateShort, formatRelativeDays, formatRub } from "$lib/core/format";
	import type { BudgetWidget } from "$lib/state/widgets/budget.svelte";
	import Icon from "../Icon.svelte";

	let { widget }: { widget: BudgetWidget } = $props();

	let newTitle = $state("");
	let newAmount = $state("");
	let newCategory = $state<BudgetCategoryId>("food");
	let formError = $state("");

	function categoryLabel(id: BudgetCategoryId): string {
		return BUDGET_CATEGORIES.find((category) => category.id === id)?.label ?? "Прочее";
	}

	function dateLabel(daysAgo?: number, createdAt?: string): string {
		if (typeof daysAgo === "number") return formatRelativeDays(daysAgo);
		if (createdAt) return formatDateShort(new Date(createdAt));
		return "—";
	}

	function addExpense(event: SubmitEvent): void {
		event.preventDefault();
		formError = "";
		const amount = Number(newAmount.replace(",", "."));
		if (!newTitle.trim()) {
			formError = "Введите название.";
			return;
		}
		if (!Number.isFinite(amount) || amount <= 0) {
			formError = "Сумма должна быть больше нуля.";
			return;
		}
		if (!widget.addExpense(newTitle, amount, newCategory)) return;
		newTitle = "";
		newAmount = "";
		newCategory = "food";
	}
</script>

<div class="budget">
	<div class="summary">
		<div>
			<span class="label">Потрачено</span>
			<strong>{formatRub(widget.total)}</strong>
			<span class="limit">из {formatRub(widget.limit)}</span>
		</div>
		<div class="remaining">
			<span class="label">Остаток</span>
			<strong class:negative={widget.remaining < 0}>{formatRub(widget.remaining)}</strong>
		</div>
	</div>

	<div
		class="progress"
		class:over={widget.remaining < 0}
		role="progressbar"
		aria-label="Расход бюджета"
		aria-valuemin="0"
		aria-valuemax={widget.limit}
		aria-valuenow={Math.min(widget.total, widget.limit)}
	>
		<span style:width={`${widget.progress}%`}></span>
	</div>
	<span class="progress-label">{Math.round(widget.progress)}% лимита</span>

	<ul class="expenses">
		{#each widget.expenses as expense (expense.id)}
			<li>
				<div>
					<strong>{expense.title}</strong>
					<span>{categoryLabel(expense.category)} · {dateLabel(expense.daysAgo, expense.createdAt)}</span>
				</div>
				<span class="amount">{formatRub(expense.amount)}</span>
				<button
					type="button"
					aria-label={`Удалить расход «${expense.title}»`}
					title="Удалить расход"
					onclick={() => widget.removeExpense(expense.id)}
				>
					<Icon name="close" size={14} />
				</button>
			</li>
		{/each}
	</ul>

	<form class="add-form" onsubmit={addExpense}>
		<label class="sr-only" for="expense-title">Название расхода</label>
		<input
			id="expense-title"
			type="text"
			bind:value={newTitle}
			placeholder="Новый расход"
			maxlength="80"
			autocomplete="off"
		/>
		<label class="sr-only" for="expense-amount">Сумма</label>
		<input
			id="expense-amount"
			class="amount-input"
			type="text"
			inputmode="decimal"
			bind:value={newAmount}
			placeholder="₽"
			maxlength="12"
		/>
		<label class="sr-only" for="expense-category">Категория</label>
		<select id="expense-category" bind:value={newCategory}>
			{#each BUDGET_CATEGORIES as category}
				<option value={category.id}>{category.label}</option>
			{/each}
		</select>
		<button type="submit" class="add-button" aria-label="Добавить расход">
			<Icon name="plus" size={15} />
		</button>
		{#if formError}
			<p class="error" role="alert">{formError}</p>
		{/if}
	</form>

	<div class="foot">
		<span>Демо-бюджет</span>
		<span>хранится в браузере</span>
	</div>
</div>

<style>
	.budget {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.summary {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
	}

	.label {
		display: block;
		color: var(--muted);
		font-size: 0.78rem;
	}

	.summary strong {
		display: block;
		margin-top: 0.1rem;
		font-family: var(--f-mono);
		font-size: 1.6rem;
		font-weight: 400;
		line-height: 1.1;
	}

	.limit {
		color: var(--faint);
		font-size: 0.75rem;
	}

	.remaining {
		text-align: right;
	}

	.remaining strong {
		font-size: 1rem;
		font-weight: 500;
	}

	.remaining strong.negative {
		color: var(--red);
	}

	.progress {
		height: 0.45rem;
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

	.progress.over span {
		background: var(--red);
	}

	.progress-label {
		margin-top: -0.55rem;
		color: var(--faint);
		font-size: 0.7rem;
	}

	.expenses {
		display: flex;
		flex-direction: column;
		max-height: 12rem;
		overflow: auto;
		border-top: 1px solid var(--line);
	}

	.expenses li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 0;
		border-bottom: 1px solid var(--line);
	}

	.expenses li > div {
		flex: 1;
		min-width: 0;
	}

	.expenses strong {
		display: block;
		font-size: 0.82rem;
		font-weight: 500;
		line-height: 1.3;
	}

	.expenses li > div span {
		color: var(--faint);
		font-size: 0.7rem;
	}

	.amount {
		flex-shrink: 0;
		color: var(--muted);
		font-family: var(--f-mono);
		font-size: 0.75rem;
	}

	.expenses button {
		display: grid;
		place-items: center;
		width: 1.8rem;
		height: 1.8rem;
		flex-shrink: 0;
		border-radius: var(--radius);
		color: var(--faint);
	}

	.expenses button:hover {
		background: var(--red-soft);
		color: var(--red);
	}

	.add-form {
		display: grid;
		grid-template-columns: 1fr 5rem auto auto;
		gap: 0.35rem;
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

	.add-form .amount-input {
		width: 5rem;
		font-family: var(--f-mono);
	}

	.add-form select {
		max-width: 7.5rem;
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

	.foot {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		color: var(--faint);
		font-size: 0.7rem;
	}

	@media (max-width: 520px) {
		.add-form {
			grid-template-columns: 1fr 4.5rem auto;
		}

		.add-form select {
			grid-column: 1 / 3;
			max-width: none;
		}

		.add-button {
			grid-column: 3;
			grid-row: 1 / 3;
			height: 100%;
			min-height: 2.2rem;
		}
	}
</style>
