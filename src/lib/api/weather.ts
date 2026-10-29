import { city } from "$lib/content";
import { fetchJson } from "$lib/core/http";
import type { IconName } from "$lib/icons";

export interface MetForecast {
	properties: {
		meta: {
			updated_at: string;
		};
		timeseries: Array<{
			time: string;
			data: {
				instant: {
					details: {
						air_temperature: number;
						relative_humidity: number;
						wind_speed: number;
						wind_from_direction: number;
						cloud_area_fraction: number;
					};
				};
				next_1_hours?: {
					summary?: { symbol_code: string };
					details?: { precipitation_amount?: number };
				};
				next_6_hours?: {
					summary?: { symbol_code: string };
					details?: { precipitation_amount?: number };
				};
				next_12_hours?: {
					summary?: { symbol_code: string };
				};
			};
		}>;
	};
}

export interface WeatherCurrent {
	time: string;
	temperature: number;
	humidity: number;
	windSpeed: number;
	windDirection: number;
	precipitation: number;
	symbol: string;
}

export interface WeatherDay {
	date: string;
	symbol: string;
	min: number;
	max: number;
	precipitation: number;
}

export interface WeatherData {
	updatedAt: string;
	current: WeatherCurrent;
	days: WeatherDay[];
}

export interface WeatherInfo {
	label: string;
	icon: IconName;
}

export function weatherUrl(): string {
	const params = new URLSearchParams({
		lat: String(city.lat),
		lon: String(city.lon)
	});
	return `https://api.met.no/weatherapi/locationforecast/2.0/compact?${params.toString()}`;
}

function localDateKey(iso: string): string {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: city.timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(new Date(iso));
	const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
	return `${get("year")}-${get("month")}-${get("day")}`;
}

function localHour(iso: string): number {
	return Number(
		new Intl.DateTimeFormat("ru-RU", {
			timeZone: city.timeZone,
			hour: "2-digit",
			hour12: false
		}).format(new Date(iso))
	);
}

function symbolOf(entry: MetForecast["properties"]["timeseries"][number]): string {
	return (
		entry.data.next_1_hours?.summary?.symbol_code ??
		entry.data.next_6_hours?.summary?.symbol_code ??
		entry.data.next_12_hours?.summary?.symbol_code ??
		"cloudy"
	);
}

function precipitationOf(entry: MetForecast["properties"]["timeseries"][number]): number {
	return (
		entry.data.next_1_hours?.details?.precipitation_amount ??
		entry.data.next_6_hours?.details?.precipitation_amount ??
		0
	);
}

export async function fetchWeather(signal?: AbortSignal): Promise<WeatherData> {
	const response = await fetchJson<MetForecast>(weatherUrl(), signal, 15_000);
	const series = response.properties?.timeseries;
	if (!Array.isArray(series) || series.length === 0) {
		throw new Error("MET Norway вернул пустой прогноз.");
	}

	const first = series[0];
	if (!first) throw new Error("MET Norway вернул пустой прогноз.");

	const current: WeatherCurrent = {
		time: first.time,
		temperature: first.data.instant.details.air_temperature,
		humidity: first.data.instant.details.relative_humidity,
		windSpeed: Math.round(first.data.instant.details.wind_speed * 3.6),
		windDirection: first.data.instant.details.wind_from_direction,
		precipitation: precipitationOf(first),
		symbol: symbolOf(first)
	};

	const groups = new Map<string, MetForecast["properties"]["timeseries"]>();
	for (const entry of series) {
		const key = localDateKey(entry.time);
		const list = groups.get(key) ?? [];
		list.push(entry);
		groups.set(key, list);
	}

	const days: WeatherDay[] = [...groups.entries()].slice(0, 3).map(([date, entries]) => {
		const temperatures = entries.map((entry) => entry.data.instant.details.air_temperature);
		const noon =
			entries.find((entry) => localHour(entry.time) === 12) ??
			entries[Math.floor(entries.length / 2)] ??
			entries[0];
		return {
			date,
			symbol: noon ? symbolOf(noon) : current.symbol,
			min: Math.min(...temperatures),
			max: Math.max(...temperatures),
			precipitation: entries.reduce((sum, entry) => sum + precipitationOf(entry), 0)
		};
	});

	return {
		updatedAt: response.properties.meta.updated_at,
		current,
		days
	};
}

export function weatherInfo(symbol: string): WeatherInfo {
	const code = symbol.toLowerCase();
	if (code.includes("thunder")) return { label: "Гроза", icon: "storm" };
	if (code.includes("heavysnow")) return { label: "Сильный снег", icon: "snow" };
	if (code.includes("lightsnow")) return { label: "Небольшой снег", icon: "snow" };
	if (code.includes("snow")) return { label: "Снег", icon: "snow" };
	if (code.includes("heavysleet")) return { label: "Сильный мокрый снег", icon: "snow" };
	if (code.includes("lightsleet")) return { label: "Небольшой мокрый снег", icon: "snow" };
	if (code.includes("sleet")) return { label: "Мокрый снег", icon: "snow" };
	if (code.includes("heavyrain")) return { label: "Сильный дождь", icon: "rain" };
	if (code.includes("lightrain")) return { label: "Небольшой дождь", icon: "rain" };
	if (code.includes("rain")) return { label: "Дождь", icon: "rain" };
	if (code.includes("fog")) return { label: "Туман", icon: "fog" };
	if (code.includes("clearsky")) {
		return { label: "Ясно", icon: code.includes("night") ? "moon" : "sun" };
	}
	if (code.includes("fair")) {
		return { label: "Малооблачно", icon: code.includes("night") ? "moon" : "cloud-sun" };
	}
	if (code.includes("partlycloudy")) {
		return { label: "Переменная облачность", icon: "cloud-sun" };
	}
	if (code.includes("cloudy")) return { label: "Облачно", icon: "cloud" };
	return { label: "Облачно", icon: "cloud" };
}

export function windDirection(degrees: number): string {
	const directions = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
	return directions[Math.round(degrees / 45) % 8] ?? "С";
}
