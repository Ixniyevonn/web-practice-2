<script lang="ts">
	import type { Widget } from "$lib/state/widget.svelte";
	import { BudgetWidget as BudgetModel } from "$lib/state/widgets/budget.svelte";
	import { ClockWidget as ClockModel } from "$lib/state/widgets/clock.svelte";
	import { CurrencyWidget as CurrencyModel } from "$lib/state/widgets/currency.svelte";
	import { MapWidget as MapModel } from "$lib/state/widgets/map.svelte";
	import { NotesWidget as NotesModel } from "$lib/state/widgets/notes.svelte";
	import { SunWidget as SunModel } from "$lib/state/widgets/sun.svelte";
	import { TodoWidget as TodoModel } from "$lib/state/widgets/todo.svelte";
	import { WeatherWidget as WeatherModel } from "$lib/state/widgets/weather.svelte";
	import BudgetWidget from "./widgets/BudgetWidget.svelte";
	import ClockWidget from "./widgets/ClockWidget.svelte";
	import CurrencyWidget from "./widgets/CurrencyWidget.svelte";
	import MapWidget from "./widgets/MapWidget.svelte";
	import NotesWidget from "./widgets/NotesWidget.svelte";
	import SunWidget from "./widgets/SunWidget.svelte";
	import TodoWidget from "./widgets/TodoWidget.svelte";
	import WeatherWidget from "./widgets/WeatherWidget.svelte";

	let { widget }: { widget: Widget } = $props();
</script>

{#if widget instanceof TodoModel}
	<TodoWidget {widget} />
{:else if widget instanceof WeatherModel}
	<WeatherWidget {widget} />
{:else if widget instanceof CurrencyModel}
	<CurrencyWidget {widget} />
{:else if widget instanceof ClockModel}
	<ClockWidget {widget} />
{:else if widget instanceof SunModel}
	<SunWidget {widget} />
{:else if widget instanceof BudgetModel}
	<BudgetWidget {widget} />
{:else if widget instanceof MapModel}
	<MapWidget {widget} />
{:else if widget instanceof NotesModel}
	<NotesWidget {widget} />
{/if}
