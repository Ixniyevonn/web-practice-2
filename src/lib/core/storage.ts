import { browser } from "$app/environment";

export const DASHBOARD_STORAGE_KEY = "pj-dashboard-v4";

export interface CacheEntry<T> {
	data: T;
	savedAt: number;
}

export function storageAvailable(): boolean {
	if (!browser) return false;
	try {
		const key = "__pj_probe__";
		localStorage.setItem(key, "1");
		localStorage.removeItem(key);
		return true;
	} catch {
		return false;
	}
}

export function readJson<T>(key: string): T | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return null;
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
}

export function writeJson(key: string, value: unknown): boolean {
	if (!browser) return false;
	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch {
		return false;
	}
}

export function removeKey(key: string): void {
	if (!browser) return;
	try {
		localStorage.removeItem(key);
	} catch {
		/* Storage can be disabled; the UI keeps working in memory. */
	}
}

export function readCache<T>(key: string): CacheEntry<T> | null {
	const entry = readJson<CacheEntry<T>>(key);
	if (!entry || typeof entry.savedAt !== "number" || !("data" in entry)) return null;
	return entry;
}

export function writeCache<T>(key: string, data: T): void {
	writeJson(key, { data, savedAt: Date.now() } satisfies CacheEntry<T>);
}

export function cacheAgeLabel(savedAt: number | null): string {
	if (!savedAt) return "нет данных";
	const diff = Math.max(0, Date.now() - savedAt);
	const minutes = Math.floor(diff / 60_000);
	if (minutes < 1) return "только что";
	if (minutes < 60) return `${minutes} мин назад`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} ч назад`;
	const days = Math.floor(hours / 24);
	return `${days} дн назад`;
}
