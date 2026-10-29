import { fetchWeather, type WeatherData } from "$lib/api/weather";
import { readCache, writeCache } from "$lib/core/storage";
import { RemoteWidget } from "../remote.svelte";

const CACHE_KEY = "pj-cache-weather-v2";

export class WeatherWidget extends RemoteWidget<WeatherData> {
	readonly type = "weather" as const;

	async load(): Promise<void> {
		const cached = readCache<WeatherData>(CACHE_KEY);
		if (cached && !this.data && cached.data?.current && Array.isArray(cached.data.days)) {
			this.data = cached.data;
			this.updatedAt = cached.savedAt;
			this.usingCache = true;
		}

		const controller = this.begin();
		try {
			const data = await fetchWeather(controller.signal);
			if (!this.alive) return;
			this.succeed(data);
			writeCache(CACHE_KEY, data);
		} catch (error) {
			if (controller.signal.aborted) return;
			this.fail(error, "Не удалось загрузить погоду.");
		}
	}

	serialize(): unknown {
		return {};
	}
}
