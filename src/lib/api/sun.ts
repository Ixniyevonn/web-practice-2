import { city } from "$lib/content";
import { fetchJson } from "$lib/core/http";

export interface MetSunResponse {
	properties: {
		sunrise?: { time: string };
		sunset?: { time: string };
		solarnoon?: { time: string; disc_centre_elevation?: number; visible?: boolean };
	};
}

export interface SunData {
	date: string;
	sunrise: string;
	sunset: string;
	solarNoon: string;
	daylightMinutes: number;
	elevation: number;
}

function localDateKey(date: Date): string {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: city.timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(date);
	const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
	return `${get("year")}-${get("month")}-${get("day")}`;
}

export function sunUrl(): string {
	const params = new URLSearchParams({
		lat: String(city.lat),
		lon: String(city.lon),
		date: localDateKey(new Date()),
		offset: "+03:00"
	});
	return `https://api.met.no/weatherapi/sunrise/3.0/sun?${params.toString()}`;
}

export async function fetchSun(signal?: AbortSignal): Promise<SunData> {
	const response = await fetchJson<MetSunResponse>(sunUrl(), signal, 15_000);
	const sunrise = response.properties?.sunrise?.time;
	const sunset = response.properties?.sunset?.time;
	const solarNoon = response.properties?.solarnoon?.time;
	if (!sunrise || !sunset || !solarNoon) {
		throw new Error("MET Norway не вернул время восхода и заката.");
	}
	const daylightMinutes = Math.max(
		0,
		(new Date(sunset).getTime() - new Date(sunrise).getTime()) / 60_000
	);
	return {
		date: localDateKey(new Date(sunrise)),
		sunrise,
		sunset,
		solarNoon,
		daylightMinutes,
		elevation: response.properties.solarnoon?.disc_centre_elevation ?? 0
	};
}

export function sunProgress(sunrise: string, sunset: string, now = new Date()) {
	const start = new Date(sunrise).getTime();
	const end = new Date(sunset).getTime();
	const current = now.getTime();
	if (current <= start) return { progress: 0, isDay: false };
	if (current >= end) return { progress: 1, isDay: false };
	return { progress: (current - start) / Math.max(1, end - start), isDay: true };
}
