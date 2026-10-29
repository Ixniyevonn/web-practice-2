import {
	CURRENCIES,
	fetchCurrency,
	type CurrencyResponse
} from "$lib/api/currency";
import { readCache, writeCache } from "$lib/core/storage";
import { RemoteWidget } from "../remote.svelte";

function cacheKey(base: string): string {
	return `pj-cache-currency-${base}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export class CurrencyWidget extends RemoteWidget<CurrencyResponse> {
	readonly type = "currency" as const;
	base = $state("USD");
	quote = $state("RUB");
	amount = $state(100);

	get rate(): number | null {
		if (this.base === this.quote) return 1;
		return this.data?.rates?.[this.quote] ?? null;
	}

	get converted(): number | null {
		const rate = this.rate;
		return rate === null ? null : this.amount * rate;
	}

	async load(): Promise<void> {
		const base = this.base;
		const cached = readCache<CurrencyResponse>(cacheKey(base));
		if (
			cached &&
			(!this.data || this.data.base_code !== base) &&
			cached.data?.rates &&
			typeof cached.data.rates === "object"
		) {
			this.data = cached.data;
			this.updatedAt = cached.savedAt;
			this.usingCache = true;
		}

		const controller = this.begin();
		try {
			const data = await fetchCurrency(base, controller.signal);
			if (!this.alive || this.base !== base) return;
			this.succeed(data);
			writeCache(cacheKey(base), data);
		} catch (error) {
			if (controller.signal.aborted) return;
			this.fail(error, "Не удалось загрузить курс валют.");
		}
	}

	setBase(code: string): void {
		if (code === this.base || !CURRENCIES.some((currency) => currency.code === code)) return;
		this.base = code;
		this.data = null;
		this.updatedAt = null;
		this.usingCache = false;
		this.requestSave();
		void this.load();
	}

	setQuote(code: string): void {
		if (!CURRENCIES.some((currency) => currency.code === code)) return;
		this.quote = code;
		this.requestSave();
	}

	swap(): void {
		const nextBase = this.quote;
		const nextQuote = this.base;
		if (nextBase === this.base) return;
		this.base = nextBase;
		this.quote = nextQuote;
		this.data = null;
		this.updatedAt = null;
		this.usingCache = false;
		this.requestSave();
		void this.load();
	}

	setAmount(value: number): void {
		if (!Number.isFinite(value)) return;
		this.amount = Math.max(0, value);
		this.requestSave();
	}

	serialize(): unknown {
		return { base: this.base, quote: this.quote, amount: this.amount };
	}

	override hydrate(data: unknown): void {
		if (!isRecord(data)) return;
		if (typeof data.base === "string" && CURRENCIES.some((entry) => entry.code === data.base)) {
			this.base = data.base;
		}
		if (typeof data.quote === "string" && CURRENCIES.some((entry) => entry.code === data.quote)) {
			this.quote = data.quote;
		}
		if (typeof data.amount === "number" && Number.isFinite(data.amount)) {
			this.amount = Math.max(0, data.amount);
		}
	}
}
