import { fetchSun, type SunData } from "$lib/api/sun";
import { readCache, writeCache } from "$lib/core/storage";
import { RemoteWidget } from "../remote.svelte";

const CACHE_KEY = "pj-cache-sun-v2";

export class SunWidget extends RemoteWidget<SunData> {
	readonly type = "sun" as const;

	async load(): Promise<void> {
		const cached = readCache<SunData>(CACHE_KEY);
		if (cached && !this.data && cached.data?.sunrise && cached.data?.sunset) {
			this.data = cached.data;
			this.updatedAt = cached.savedAt;
			this.usingCache = true;
		}

		const controller = this.begin();
		try {
			const data = await fetchSun(controller.signal);
			if (!this.alive) return;
			this.succeed(data);
			writeCache(CACHE_KEY, data);
		} catch (error) {
			if (controller.signal.aborted) return;
			this.fail(error, "Не удалось загрузить данные о солнце.");
		}
	}

	serialize(): unknown {
		return {};
	}
}
