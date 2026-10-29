import { browser } from "$app/environment";
import { DEFAULT_WIDGET_ORDER, WIDGET_META, WIDGET_ORDER, type WidgetType } from "$lib/content";
import {
	DASHBOARD_STORAGE_KEY,
	readJson,
	storageAvailable,
	writeJson
} from "$lib/core/storage";
import type { Widget } from "./widget.svelte";
import { createWidget } from "./widgets/factory";

interface PersistedWidget {
	type: WidgetType;
	data?: unknown;
}

interface PersistedDashboard {
	version?: number;
	savedAt?: number;
	widgets?: PersistedWidget[];
}

function isWidgetType(value: string): value is WidgetType {
	return value in WIDGET_META;
}

export interface AddWidgetResult {
	ok: boolean;
	message: string;
}

/**
 * Owns the widget collection, the persistence schema and cross-tab sync.
 * Widgets themselves own their data and lifecycle.
 */
export class Dashboard {
	widgets = $state<Widget[]>([]);
	storageAvailable = $state(true);
	storageNotice = $state("");
	lastSavedAt = $state<number | null>(null);
	initialized = $state(false);
	/** Changes when the whole collection is replaced, so views remount cleanly. */
	generation = $state(0);

	private storageHandler: ((event: StorageEvent) => void) | null = null;
	private destroyed = false;

	constructor() {
		this.seed();
	}

	get count(): number {
		return this.widgets.length;
	}

	get availableTypes(): WidgetType[] {
		return WIDGET_ORDER.filter((type) => !this.has(type));
	}

	has(type: WidgetType): boolean {
		return this.widgets.some((widget) => widget.type === type);
	}

	init(): void {
		if (!browser || this.initialized) return;
		this.initialized = true;
		this.storageAvailable = storageAvailable();

		if (!this.storageAvailable) {
			this.storageNotice =
				"Браузер не разрешает localStorage: изменения живут до перезагрузки страницы.";
			return;
		}

		const raw = readJson<PersistedDashboard>(DASHBOARD_STORAGE_KEY);
		if (!raw) {
			this.save();
		} else {
			this.load(raw);
		}

		this.storageHandler = (event) => {
			if (event.key !== DASHBOARD_STORAGE_KEY || !event.newValue) return;
			const next = readJson<PersistedDashboard>(DASHBOARD_STORAGE_KEY);
			if (next) this.load(next);
		};
		window.addEventListener("storage", this.storageHandler);
	}

	destroy(): void {
		this.destroyed = true;
		if (this.storageHandler) {
			window.removeEventListener("storage", this.storageHandler);
			this.storageHandler = null;
		}
		this.destroyWidgets();
	}

	seed(): void {
		this.generation += 1;
		this.widgets = DEFAULT_WIDGET_ORDER.map((type) => this.create(type));
	}

	create(type: WidgetType): Widget {
		return createWidget(type, () => this.save());
	}

	add(type: WidgetType): AddWidgetResult {
		if (this.has(type)) {
			return { ok: false, message: "Этот виджет уже есть на панели." };
		}
		this.widgets.push(this.create(type));
		this.save();
		return { ok: true, message: `Виджет «${WIDGET_META[type].title}» добавлен.` };
	}

	/** Alias kept close to the wording of the assignment. */
	addWidget(type: WidgetType): AddWidgetResult {
		return this.add(type);
	}

	remove(type: WidgetType): void {
		const index = this.widgets.findIndex((widget) => widget.type === type);
		if (index < 0) return;
		const [removed] = this.widgets.splice(index, 1);
		removed?.destroy();
		this.save();
	}

	/** Alias kept close to the wording of the assignment. */
	removeWidget(type: WidgetType): void {
		this.remove(type);
	}

	move(type: WidgetType, direction: -1 | 1): void {
		const index = this.widgets.findIndex((widget) => widget.type === type);
		if (index < 0) return;
		this.moveTo(type, index + direction);
	}

	/** Moves a widget to an absolute position, used by drag and drop. */
	moveTo(type: WidgetType, target: number): void {
		const index = this.widgets.findIndex((widget) => widget.type === type);
		if (index < 0) return;
		const next = Math.max(0, Math.min(this.widgets.length - 1, target));
		if (next === index) return;
		const [widget] = this.widgets.splice(index, 1);
		if (!widget) return;
		this.widgets.splice(next, 0, widget);
		this.save();
	}

	reset(): void {
		this.destroyWidgets();
		this.seed();
		this.storageNotice = "";
		this.save();
	}

	save(): void {
		if (!browser || this.destroyed || !this.storageAvailable) return;
		const payload: PersistedDashboard = {
			version: 1,
			savedAt: Date.now(),
			widgets: this.widgets.map((widget) => ({
				type: widget.type,
				data: widget.serialize()
			}))
		};
		if (!writeJson(DASHBOARD_STORAGE_KEY, payload)) {
			this.storageAvailable = false;
			this.storageNotice =
				"Не удалось сохранить панель: браузер запретил localStorage. Изменения останутся в памяти.";
			return;
		}
		this.lastSavedAt = payload.savedAt ?? Date.now();
	}

	private load(raw: PersistedDashboard): void {
		if (this.destroyed) return;
		if (!Array.isArray(raw.widgets)) {
			this.storageNotice = "Сохранение повреждено — восстановлен демонстрационный набор.";
			this.save();
			return;
		}
		const stored = raw.widgets;
		const next: Widget[] = [];
		const seen = new Set<WidgetType>();

		for (const item of stored) {
			if (!item || typeof item.type !== "string") continue;
			if (!isWidgetType(item.type) || seen.has(item.type)) continue;
			try {
				const widget = this.create(item.type);
				widget.hydrate(item.data);
				next.push(widget);
				seen.add(item.type);
			} catch {
				// A broken widget is skipped; the rest of the dashboard survives.
			}
		}

		// A stored non-empty list with no valid widgets is corruption, not intent.
		if (stored.length > 0 && next.length === 0) {
			this.storageNotice = "Сохранённые виджеты повреждены — восстановлен демонстрационный набор.";
			this.save();
			return;
		}

		this.destroyWidgets();
		this.generation += 1;
		this.widgets = next;
		this.lastSavedAt = typeof raw.savedAt === "number" ? raw.savedAt : null;
	}

	private destroyWidgets(): void {
		for (const widget of this.widgets) widget.destroy();
	}
}
