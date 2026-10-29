import type { IconName } from "./icons";

export type WidgetType =
	| "todo"
	| "weather"
	| "currency"
	| "clock"
	| "sun"
	| "budget"
	| "map"
	| "notes";

export type TaskPriority = "high" | "normal" | "low";
export type TaskFilter = "all" | "active" | "done";

export interface Task {
	id: string;
	title: string;
	done: boolean;
	priority: TaskPriority;
	/** Relative deadline for the built-in demo checklist. */
	dueInDays?: number;
	/** Absolute deadline for tasks created by the visitor. */
	dueDate?: string;
	createdAt: string;
	demo?: boolean;
}

export type BudgetCategoryId = "housing" | "food" | "transport" | "tickets" | "other";

export interface BudgetCategory {
	id: BudgetCategoryId;
	label: string;
	color: string;
}

export interface BudgetExpense {
	id: string;
	title: string;
	amount: number;
	category: BudgetCategoryId;
	daysAgo?: number;
	createdAt?: string;
	demo?: boolean;
}

export interface Note {
	id: string;
	title: string;
	text: string;
	place?: string;
	daysAgo?: number;
	createdAt?: string;
	demo?: boolean;
}

export interface MapPoint {
	id: string;
	name: string;
	address: string;
	description: string;
	lat: number;
	lon: number;
}

export interface WidgetMeta {
	type: WidgetType;
	title: string;
	kicker: string;
	description: string;
	icon: IconName;
	span: 4 | 8;
	demo: boolean;
}

export const site = {
	title: "Путевой журнал",
	subtitle: "Городской штаб · Санкт-Петербург",
	tagline: "Погода, дела, деньги и карта — в одном месте.",
	description:
		"Городской штаб в Санкт-Петербурге: погода, курс валют, бюджет, задачи, заметки и прогулка по центру. SvelteKit, TypeScript, статическая сборка.",
	author: "Савва Крупницкий",
	email: "ixniyevonn@gmail.com",
	telegram: "@ixniyevonn",
	telegramUrl: "https://t.me/ixniyevonn",
	github: "Ixniyevonn",
	githubUrl: "https://github.com/Ixniyevonn",
	repoUrl: "https://github.com/Ixniyevonn/web-practice-2",
	siteUrl: "https://ixniyevonn.github.io/web-practice-2/",
	year: 2026
} as const;

export const city = {
	name: "Санкт-Петербург",
	short: "СПб",
	country: "Россия",
	lat: 59.9343,
	lon: 30.3351,
	timeZone: "Europe/Moscow",
	coordinateLabel: "59.9343° N · 30.3351° E",
	timeZoneLabel: "Europe/Moscow · UTC+3",
	population: "5,6 млн",
	founded: 1703
} as const;

export const WORLD_CITIES = [
	{
		id: "spb",
		name: "Санкт-Петербург",
		short: "СПб",
		timeZone: "Europe/Moscow",
		highlight: true
	},
	{
		id: "helsinki",
		name: "Хельсинки",
		short: "HEL",
		timeZone: "Europe/Helsinki",
		highlight: false
	},
	{
		id: "tallinn",
		name: "Таллин",
		short: "TLL",
		timeZone: "Europe/Tallinn",
		highlight: false
	},
	{
		id: "stockholm",
		name: "Стокгольм",
		short: "STO",
		timeZone: "Europe/Stockholm",
		highlight: false
	}
] as const;

export const WIDGET_META: Record<WidgetType, WidgetMeta> = {
	todo: {
		type: "todo",
		title: "Дела",
		kicker: "ДЕЛА",
		description: "Задачи, сроки и приоритеты.",
		icon: "check",
		span: 4,
		demo: true
	},
	weather: {
		type: "weather",
		title: "Погода",
		kicker: "ПОГОДА",
		description: "Сейчас и на три дня.",
		icon: "cloud-sun",
		span: 4,
		demo: false
	},
	currency: {
		type: "currency",
		title: "Курс валют",
		kicker: "ВАЛЮТЫ",
		description: "Курс и конвертер.",
		icon: "wallet",
		span: 4,
		demo: false
	},
	clock: {
		type: "clock",
		title: "Время",
		kicker: "ВРЕМЯ",
		description: "Петербург, Хельсинки, Таллин, Стокгольм.",
		icon: "clock",
		span: 4,
		demo: false
	},
	sun: {
		type: "sun",
		title: "Солнце",
		kicker: "СОЛНЦЕ",
		description: "Восход, закат и длина дня.",
		icon: "sun",
		span: 4,
		demo: false
	},
	budget: {
		type: "budget",
		title: "Бюджет",
		kicker: "БЮДЖЕТ",
		description: "Расходы и остаток.",
		icon: "ruble",
		span: 4,
		demo: true
	},
	map: {
		type: "map",
		title: "Прогулка по центру",
		kicker: "КАРТА",
		description: "Восемь точек в центре Петербурга.",
		icon: "map",
		span: 8,
		demo: true
	},
	notes: {
		type: "notes",
		title: "Заметки",
		kicker: "ЗАМЕТКИ",
		description: "Наблюдения о городе.",
		icon: "note",
		span: 8,
		demo: true
	}
};

export const WIDGET_ORDER: WidgetType[] = [
	"todo",
	"weather",
	"currency",
	"clock",
	"sun",
	"budget",
	"map",
	"notes"
];

export const DEFAULT_WIDGET_ORDER: WidgetType[] = [
	"todo",
	"weather",
	"notes",
	"budget",
	"currency",
	"map"
];

export const TASK_PRIORITIES: { id: TaskPriority; label: string; short: string }[] = [
	{ id: "high", label: "Важно", short: "В" },
	{ id: "normal", label: "Обычно", short: "О" },
	{ id: "low", label: "Потом", short: "П" }
];

export const DEMO_TASKS: Task[] = [
	{
		id: "task-demo-01",
		title: "Продлить проездной на месяц",
		done: false,
		priority: "high",
		dueInDays: 2,
		createdAt: "2026-10-01T09:00:00.000Z",
		demo: true
	},
	{
		id: "task-demo-02",
		title: "Записаться к врачу",
		done: false,
		priority: "high",
		dueInDays: 4,
		createdAt: "2026-10-01T09:01:00.000Z",
		demo: true
	},
	{
		id: "task-demo-03",
		title: "Забрать посылку из пункта выдачи",
		done: true,
		priority: "normal",
		dueInDays: 1,
		createdAt: "2026-10-01T09:02:00.000Z",
		demo: true
	},
	{
		id: "task-demo-04",
		title: "Купить продукты на неделю",
		done: true,
		priority: "normal",
		dueInDays: 0,
		createdAt: "2026-10-01T09:03:00.000Z",
		demo: true
	},
	{
		id: "task-demo-05",
		title: "Оплатить коммуналку",
		done: false,
		priority: "high",
		dueInDays: 5,
		createdAt: "2026-10-01T09:04:00.000Z",
		demo: true
	},
	{
		id: "task-demo-06",
		title: "Сдать курсовую руководителю",
		done: false,
		priority: "high",
		dueInDays: 7,
		createdAt: "2026-10-01T09:05:00.000Z",
		demo: true
	}
];

export const BUDGET_CATEGORIES: BudgetCategory[] = [
	{ id: "housing", label: "Жильё", color: "#1d4fff" },
	{ id: "food", label: "Еда", color: "#4f7cff" },
	{ id: "transport", label: "Транспорт", color: "#7fa1ff" },
	{ id: "tickets", label: "Билеты", color: "#a9c0ff" },
	{ id: "other", label: "Прочее", color: "#c9d6f5" }
];

export const DEMO_BUDGET_LIMIT = 40_000;

export const DEMO_EXPENSES: BudgetExpense[] = [
	{
		id: "expense-demo-01",
		title: "Аренда комнаты",
		amount: 18_000,
		category: "housing",
		daysAgo: 12,
		demo: true
	},
	{
		id: "expense-demo-02",
		title: "Продукты на неделю",
		amount: 4_200,
		category: "food",
		daysAgo: 2,
		demo: true
	},
	{
		id: "expense-demo-03",
		title: "Проездной на месяц",
		amount: 2_500,
		category: "transport",
		daysAgo: 5,
		demo: true
	},
	{
		id: "expense-demo-04",
		title: "Билет в Мариинский театр",
		amount: 2_800,
		category: "tickets",
		daysAgo: 1,
		demo: true
	},
	{
		id: "expense-demo-05",
		title: "Кофе и выпечка",
		amount: 650,
		category: "other",
		daysAgo: 0,
		demo: true
	}
];

export const DEMO_NOTES: Note[] = [
	{
		id: "note-demo-01",
		title: "Свет на Фонтанке",
		place: "Набережная Фонтанки",
		daysAgo: 3,
		demo: true,
		text: "В шесть вечера вода становится почти чёрной, а фасады — медовыми. Лучший свет для фотографий не на Невском, а во дворах между Фонтанкой и Садовой."
	},
	{
		id: "note-demo-02",
		title: "Дворы Петроградской",
		place: "Петроградская сторона",
		daysAgo: 6,
		demo: true,
		text: "Зашёл во двор на Подъяческой: пять колодцев, голуби, бельё на верёвках и запах кофе из окна. Петербург сжимается до нескольких метров, и это работает лучше любой панорамы."
	},
	{
		id: "note-demo-03",
		title: "Маршрут на выходные",
		place: "Центр",
		daysAgo: 1,
		demo: true,
		text: "Если идти от Дворцовой к Петропавловке через Стрелку, город показывает три разных берега за один час. Взять кофе, не спешить, смотреть на воду."
	}
];

export const MAP_POINTS: MapPoint[] = [
	{
		id: "dvortsovaya",
		name: "Дворцовая площадь",
		address: "Дворцовая площадь",
		description:
			"Александровская колонна, арка Генерального штаба и Зимний дворец. Удобная точка старта.",
		lat: 59.9386,
		lon: 30.3141
	},
	{
		id: "hermitage",
		name: "Эрмитаж",
		address: "Дворцовая наб., 38",
		description: "Зимний дворец и главный музей города. Вход с Дворцовой площади.",
		lat: 59.9398,
		lon: 30.3146
	},
	{
		id: "bronze-horseman",
		name: "Медный всадник",
		address: "Сенатская площадь",
		description: "Памятник Петру I на Сенатской площади и вид на Неву.",
		lat: 59.9364,
		lon: 30.3022
	},
	{
		id: "isaac",
		name: "Исаакиевский собор",
		address: "Исаакиевская пл., 4",
		description: "Собор с колоннадой и смотровой площадкой на крыше.",
		lat: 59.9343,
		lon: 30.3061
	},
	{
		id: "spit",
		name: "Стрелка Васильевского острова",
		address: "Биржевая площадь",
		description: "Ростральные колонны, здание Биржи и панорама Невы.",
		lat: 59.9443,
		lon: 30.3061
	},
	{
		id: "peter-paul",
		name: "Петропавловская крепость",
		address: "Петропавловская крепость",
		description: "Место основания города, Петропавловский собор и набережная.",
		lat: 59.95,
		lon: 30.3158
	},
	{
		id: "summer-garden",
		name: "Летний сад",
		address: "Летний сад",
		description: "Аллеи, скульптуры и Летний дворец Петра I.",
		lat: 59.9448,
		lon: 30.332
	},
	{
		id: "savior",
		name: "Спас на Крови",
		address: "наб. канала Грибоедова, 2Б",
		description: "Мозаики и купола на канале Грибоедова.",
		lat: 59.9401,
		lon: 30.329
	}
];
