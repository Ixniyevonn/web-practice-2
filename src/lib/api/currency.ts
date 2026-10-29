import { fetchJson } from "$lib/core/http";

export interface CurrencyResponse {
	result: string;
	provider: string;
	documentation?: string;
	terms_of_use?: string;
	time_last_update_unix: number;
	time_last_update_utc: string;
	time_next_update_unix: number;
	time_next_update_utc: string;
	base_code: string;
	rates: Record<string, number>;
}

export interface CurrencyOption {
	code: string;
	name: string;
	symbol: string;
}

export const CURRENCIES: CurrencyOption[] = [
	{ code: "RUB", name: "Российский рубль", symbol: "₽" },
	{ code: "USD", name: "Доллар США", symbol: "$" },
	{ code: "EUR", name: "Евро", symbol: "€" },
	{ code: "GBP", name: "Фунт стерлингов", symbol: "£" },
	{ code: "CNY", name: "Китайский юань", symbol: "¥" },
	{ code: "JPY", name: "Японская иена", symbol: "¥" },
	{ code: "CHF", name: "Швейцарский франк", symbol: "₣" },
	{ code: "TRY", name: "Турецкая лира", symbol: "₺" },
	{ code: "AED", name: "Дирхам ОАЭ", symbol: "د.إ" },
	{ code: "KZT", name: "Казахстанский тенге", symbol: "₸" },
	{ code: "GEL", name: "Грузинский лари", symbol: "₾" },
	{ code: "AMD", name: "Армянский драм", symbol: "֏" },
	{ code: "UZS", name: "Узбекский сум", symbol: "soʻm" },
	{ code: "BYN", name: "Белорусский рубль", symbol: "Br" },
	{ code: "PLN", name: "Польский злотый", symbol: "zł" },
	{ code: "CZK", name: "Чешская крона", symbol: "Kč" },
	{ code: "SEK", name: "Шведская крона", symbol: "kr" },
	{ code: "NOK", name: "Норвежская крона", symbol: "kr" },
	{ code: "DKK", name: "Датская крона", symbol: "kr" },
	{ code: "CAD", name: "Канадский доллар", symbol: "C$" },
	{ code: "AUD", name: "Австралийский доллар", symbol: "A$" },
	{ code: "HKD", name: "Гонконгский доллар", symbol: "HK$" },
	{ code: "SGD", name: "Сингапурский доллар", symbol: "S$" },
	{ code: "INR", name: "Индийская рупия", symbol: "₹" },
	{ code: "BRL", name: "Бразильский реал", symbol: "R$" },
	{ code: "ZAR", name: "Южноафриканский рэнд", symbol: "R" },
	{ code: "KRW", name: "Южнокорейская вона", symbol: "₩" },
	{ code: "THB", name: "Тайский бат", symbol: "฿" },
	{ code: "ILS", name: "Израильский шекель", symbol: "₪" },
	{ code: "MXN", name: "Мексиканское песо", symbol: "MX$" },
	{ code: "UAH", name: "Украинская гривна", symbol: "₴" }
];

export function currencyOption(code: string): CurrencyOption {
	return CURRENCIES.find((currency) => currency.code === code) ?? {
		code,
		name: code,
		symbol: code
	};
}

export function currencyUrl(base: string): string {
	return `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`;
}

export async function fetchCurrency(base: string, signal?: AbortSignal): Promise<CurrencyResponse> {
	const data = await fetchJson<CurrencyResponse>(currencyUrl(base), signal);
	if (data.result !== "success" || !data.rates) {
		throw new Error("Сервис курсов вернул ошибку.");
	}
	return data;
}
