import type { WidgetType } from "$lib/content";
import type { Widget } from "../widget.svelte";
import { BudgetWidget } from "./budget.svelte";
import { ClockWidget } from "./clock.svelte";
import { CurrencyWidget } from "./currency.svelte";
import { MapWidget } from "./map.svelte";
import { NotesWidget } from "./notes.svelte";
import { SunWidget } from "./sun.svelte";
import { TodoWidget } from "./todo.svelte";
import { WeatherWidget } from "./weather.svelte";

export function createWidget(type: WidgetType, onChange: () => void): Widget {
	switch (type) {
		case "todo":
			return new TodoWidget(onChange);
		case "weather":
			return new WeatherWidget(onChange);
		case "currency":
			return new CurrencyWidget(onChange);
		case "clock":
			return new ClockWidget(onChange);
		case "sun":
			return new SunWidget(onChange);
		case "budget":
			return new BudgetWidget(onChange);
		case "map":
			return new MapWidget(onChange);
		case "notes":
			return new NotesWidget(onChange);
	}
}
