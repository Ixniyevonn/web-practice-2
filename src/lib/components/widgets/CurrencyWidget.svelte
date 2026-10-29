<script lang="ts">
	import { onMount } from "svelte";
	import { CURRENCIES, currencyOption } from "$lib/api/currency";
	import { cacheAgeLabel } from "$lib/core/storage";
	import { formatNumber, formatRate } from "$lib/core/format";
	import type { CurrencyWidget } from "$lib/state/widgets/currency.svelte";
	import Icon from "../Icon.svelte";

	let { widget }: { widget: CurrencyWidget } = $props();

	onMount(() => {
		if (widget.status === "idle") void widget.load();
	});

	const data = $derived(widget.data);
	const rate = $derived(widget.rate);
	const converted = $derived(widget.converted);
	const base = $derived(currencyOption(widget.base));
	const quote = $derived(currencyOption(widget.quote));
	const updated = $derived(widget.updatedAt ? cacheAgeLabel(widget.updatedAt) : "");
	const rateDate = $derived(
		data?.time_last_update_utc ? new Date(data.time_last_update_utc) : null
	);

	function onAmountInput(event: Event): void {
		const value = Number((event.currentTarget as HTMLInputElement).value);
		widget.setAmount(Number.isFinite(value) ? value : 0);
	}
</script>

<div class="currency" aria-live="polite">
	<div class="currency-selects">
		<label class="select-field">
			<span class="mono">БАЗОВАЯ</span>
			<select value={widget.base} onchange={(event) => widget.setBase(event.currentTarget.value)}>
				{#each CURRENCIES as currency}
					<option value={currency.code}>{currency.code}</option>
				{/each}
			</select>
		</label>

		<button
			type="button"
			class="swap-btn"
			aria-label="Поменять валюты местами"
			title="Поменять местами"
			onclick={() => widget.swap()}
		>
			<Icon name="swap" size={16} />
		</button>

		<label class="select-field">
			<span class="mono">КОТИРУЕМАЯ</span>
			<select value={widget.quote} onchange={(event) => widget.setQuote(event.currentTarget.value)}>
				{#each CURRENCIES as currency}
					<option value={currency.code}>{currency.code}</option>
				{/each}
			</select>
		</label>
	</div>

	{#if !data && (widget.status === "idle" || widget.status === "loading")}
		<div class="rate-card skeleton-card">
			<div class="skeleton skeleton-rate"></div>
			<div class="skeleton skeleton-line"></div>
		</div>
		<div class="skeleton skeleton-line wide"></div>
		<div class="skeleton skeleton-line"></div>
	{:else if !data}
		<div class="error-panel">
			<span class="error-icon"><Icon name="alert" size={22} /></span>
			<div>
				<strong>Курс недоступен</strong>
				<p>{widget.error || "Сервис не ответил."}</p>
			</div>
			<button type="button" class="btn btn-outline btn-small" onclick={() => widget.load()}>
				<Icon name="refresh" size={14} />
				Повторить
			</button>
		</div>
	{:else}
		{#if widget.status === "error"}
			<div class="cache-note" role="status">
				<Icon name="alert" size={14} />
				<span>{widget.error} Показан последний сохранённый курс.</span>
				<button type="button" onclick={() => widget.load()}>Повторить</button>
			</div>
		{/if}

		<div class="rate-card">
			<div class="rate-top">
				<span class="mono">ТЕКУЩИЙ КУРС</span>
				<span class="rate-date">
					{rateDate
						? new Intl.DateTimeFormat("ru-RU", {
								day: "numeric",
								month: "long",
								year: "numeric"
							}).format(rateDate)
						: "дата не указана"}
				</span>
			</div>
			<div class="rate-main">
				<span class="rate-pair">1 {base.code} =</span>
				<strong class="rate-value">
					{rate === null ? "—" : formatRate(rate)}
					<span>{quote.code}</span>
				</strong>
			</div>
			<div class="rate-sub">
				<span>{base.name}</span>
				<span>→</span>
				<span>{quote.name}</span>
			</div>
		</div>

		<div class="converter">
			<label class="amount-field">
				<span class="mono">СУММА В {base.code}</span>
				<div class="amount-input">
					<span aria-hidden="true">{base.symbol}</span>
					<input
						type="number"
						min="0"
						step="any"
						value={widget.amount}
						oninput={onAmountInput}
						aria-label={`Сумма в ${base.name}`}
					/>
				</div>
			</label>
			<div class="convert-arrow" aria-hidden="true">
				<Icon name="arrow-right" size={17} />
			</div>
			<div class="result-field">
				<span class="mono">ПОЛУЧИТСЯ</span>
				<strong>
					{converted === null ? "—" : formatNumber(converted, 2)}
					<span>{quote.code}</span>
				</strong>
			</div>
		</div>

		<div class="currency-foot">
			<span>
				<a href="https://www.exchangerate-api.com/" target="_blank" rel="noreferrer">
					open.er-api.com
				</a>
				· RUB поддерживается
			</span>
			<span class="mono">ОБНОВЛЕНО {updated}</span>
			<button
				type="button"
				class="refresh-link"
				aria-label="Обновить курс"
				title="Обновить"
				onclick={() => widget.load()}
			>
				<Icon name="refresh" size={13} />
			</button>
		</div>
	{/if}
</div>

<style>
	.currency {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.currency-selects {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 1.8rem minmax(0, 1fr);
		align-items: end;
		gap: 0.35rem;
	}

	.select-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.select-field > span {
		color: var(--faint);
		font-size: 0.60rem;
	}

	.select-field select {
		width: 100%;
		height: 2rem;
		padding: 0 0.35rem;
		border: 1px solid var(--line);
		background: var(--panel);
		font-size: 0.65rem;
	}

	.swap-btn {
		display: grid;
		place-items: center;
		width: 1.8rem;
		height: 2rem;
		border: 1px solid var(--line);
		color: var(--blue);
		transition:
			background-color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}

	.swap-btn:hover {
		border-color: var(--blue);
		background: var(--blue-soft);
	}

	.rate-card {
		padding: 0.8rem;
		border: 1px solid var(--blue-line);
		background: linear-gradient(135deg, var(--blue-soft), transparent 70%);
	}

	.rate-top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
		color: var(--blue);
		font-size: 0.56rem;
	}

	.rate-date {
		color: var(--muted);
		font-family: var(--f-mono);
		font-size: 0.56rem;
		text-align: right;
	}

	.rate-main {
		display: flex;
		align-items: baseline;
		gap: 0.45rem;
		margin: 0.45rem 0 0.3rem;
	}

	.rate-pair {
		color: var(--muted);
		font-family: var(--f-mono);
		font-size: 0.65rem;
	}

	.rate-value {
		font-family: var(--f-mono);
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 400;
		line-height: 1;
		letter-spacing: -0.06em;
		font-variant-numeric: tabular-nums;
	}

	.rate-value span {
		margin-left: 0.2rem;
		color: var(--blue);
		font-size: 0.7rem;
		letter-spacing: 0;
	}

	.rate-sub {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--faint);
		font-size: 0.60rem;
	}

	.converter {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: end;
		gap: 0.45rem;
		padding: 0.7rem 0;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
	}

	.amount-field,
	.result-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.amount-field > span,
	.result-field > span {
		color: var(--faint);
		font-size: 0.60rem;
	}

	.amount-input {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		height: 2.1rem;
		padding: 0 0.4rem;
		border: 1px solid var(--line-strong);
		background: var(--bg);
	}

	.amount-input > span {
		color: var(--muted);
		font-family: var(--f-mono);
		font-size: 0.7rem;
	}

	.amount-input input {
		width: 100%;
		min-width: 0;
		border: 0;
		background: transparent;
		font-family: var(--f-mono);
		font-size: 0.9rem;
		font-variant-numeric: tabular-nums;
		outline: 0;
	}

	.convert-arrow {
		display: grid;
		place-items: center;
		height: 2.1rem;
		color: var(--faint);
	}

	.result-field strong {
		display: flex;
		align-items: baseline;
		gap: 0.2rem;
		height: 2.1rem;
		padding: 0.35rem 0.4rem;
		border: 1px solid var(--line);
		background: var(--panel-2);
		font-family: var(--f-mono);
		font-size: 0.82rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.result-field strong span {
		color: var(--faint);
		font-size: 0.60rem;
	}

	.currency-foot {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: auto;
		padding-top: 0.55rem;
		border-top: 1px solid var(--line);
		color: var(--faint);
		font-size: 0.56rem;
	}

	.currency-foot > span:first-child {
		margin-right: auto;
	}

	.currency-foot a {
		color: var(--muted);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.currency-foot a:hover {
		color: var(--blue);
	}

	.refresh-link {
		display: grid;
		place-items: center;
		width: 1.4rem;
		height: 1.4rem;
		color: var(--muted);
	}

	.refresh-link:hover {
		color: var(--blue);
	}

	.error-panel {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 1.2rem 0;
	}

	.error-icon {
		color: var(--red);
	}

	.error-panel strong {
		display: block;
		margin-bottom: 0.25rem;
		font-size: 0.86rem;
	}

	.error-panel p {
		margin: 0;
		color: var(--muted);
		font-size: 0.72rem;
		line-height: 1.45;
	}

	.cache-note {
		display: flex;
		align-items: flex-start;
		gap: 0.4rem;
		padding: 0.45rem 0.5rem;
		border: 1px solid var(--amber-line);
		background: var(--amber-soft);
		color: var(--amber);
		font-size: 0.62rem;
		line-height: 1.35;
	}

	.cache-note span {
		flex: 1;
	}

	.cache-note button {
		flex-shrink: 0;
		color: var(--amber);
		font-family: var(--f-mono);
		font-size: 0.60rem;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.skeleton-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.skeleton {
		background: linear-gradient(90deg, var(--line) 25%, var(--panel-2) 50%, var(--line) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.4s linear infinite;
	}

	.skeleton-rate {
		width: 65%;
		height: 2.4rem;
	}

	.skeleton-line {
		width: 45%;
		height: 0.65rem;
	}

	.skeleton-line.wide {
		width: 90%;
	}

	@keyframes shimmer {
		to {
			background-position: -200% 0;
		}
	}

	@media (max-width: 480px) {
		.currency-foot {
			flex-wrap: wrap;
		}

		.currency-foot > span:first-child {
			flex: 1 1 100%;
			margin-right: 0;
		}

		.currency-foot > span.mono {
			flex: 1;
		}
	}

	@media (max-width: 420px) {
		.currency-selects {
			grid-template-columns: 1fr 1.8rem 1fr;
		}

		.converter {
			grid-template-columns: 1fr;
		}

		.convert-arrow {
			transform: rotate(90deg);
			height: 1rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton {
			animation: none;
		}
	}
</style>
