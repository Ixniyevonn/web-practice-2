const RU = "ru-RU";

export function uid(prefix = "id"): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return `${prefix}-${crypto.randomUUID()}`;
	}
	return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function todayISO(): string {
	const now = new Date();
	const offset = now.getTimezoneOffset();
	return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export function parseISODate(value: string): Date {
	return new Date(`${value}T12:00:00`);
}

export function formatNumber(value: number, digits = 0): string {
	return new Intl.NumberFormat(RU, {
		maximumFractionDigits: digits,
		minimumFractionDigits: digits
	}).format(value);
}

export function formatRub(value: number, digits = 0): string {
	return new Intl.NumberFormat(RU, {
		style: "currency",
		currency: "RUB",
		maximumFractionDigits: digits,
		minimumFractionDigits: digits
	}).format(value);
}

export function formatRate(value: number): string {
	const digits = value !== 0 && Math.abs(value) < 1 ? 4 : 2;
	return new Intl.NumberFormat(RU, {
		maximumFractionDigits: digits,
		minimumFractionDigits: value >= 1 ? 2 : 0
	}).format(value);
}

export function formatTemperature(value: number): string {
	const rounded = Math.round(value);
	return `${rounded > 0 ? "+" : ""}${rounded}°`;
}

export function formatDateLong(date: Date): string {
	return new Intl.DateTimeFormat(RU, {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	}).format(date);
}

export function formatDateShort(date: Date): string {
	return new Intl.DateTimeFormat(RU, {
		day: "numeric",
		month: "short"
	}).format(date);
}

export function formatTime(date: Date, withSeconds = false): string {
	return new Intl.DateTimeFormat(RU, {
		hour: "2-digit",
		minute: "2-digit",
		...(withSeconds ? { second: "2-digit" } : {}),
		hour12: false
	}).format(date);
}

export function formatTimeInZone(date: Date, timeZone: string, withSeconds = false): string {
	return new Intl.DateTimeFormat(RU, {
		timeZone,
		hour: "2-digit",
		minute: "2-digit",
		...(withSeconds ? { second: "2-digit" } : {}),
		hour12: false
	}).format(date);
}

export function formatDateInZone(date: Date, timeZone: string): string {
	return new Intl.DateTimeFormat(RU, {
		timeZone,
		weekday: "short",
		day: "numeric",
		month: "short"
	}).format(date);
}

export function formatOffset(date: Date, timeZone: string): string {
	const parts = new Intl.DateTimeFormat(RU, {
		timeZone,
		timeZoneName: "longOffset"
	}).formatToParts(date);
	const raw = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT+00:00";
	return raw.replace("GMT", "UTC").replace(":00", "");
}

export function offsetMinutes(date: Date, timeZone: string): number {
	const value = formatOffset(date, timeZone);
	const match = value.match(/UTC([+-])(\d{2})(?::(\d{2}))?/);
	if (!match) return 0;
	const sign = match[1] === "-" ? -1 : 1;
	return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0));
}

export function formatOffsetDifference(date: Date, timeZone: string, baseZone: string): string {
	const diff = offsetMinutes(date, timeZone) - offsetMinutes(date, baseZone);
	if (diff === 0) return "как в СПб";
	const sign = diff > 0 ? "+" : "−";
	const hours = Math.floor(Math.abs(diff) / 60);
	const minutes = Math.abs(diff) % 60;
	return `${sign}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""} ч`;
}

export function formatRelativeDays(daysAgo: number): string {
	if (daysAgo <= 0) return "сегодня";
	if (daysAgo === 1) return "вчера";
	if (daysAgo < 5) return `${daysAgo} дня назад`;
	return `${daysAgo} дней назад`;
}

export function formatDeadline(dueInDays?: number, dueDate?: string): string {
	if (typeof dueInDays === "number") {
		if (dueInDays < 0) return `просрочено на ${Math.abs(dueInDays)} дн.`;
		if (dueInDays === 0) return "сегодня";
		if (dueInDays === 1) return "завтра";
		if (dueInDays < 5) return `через ${dueInDays} дня`;
		return `через ${dueInDays} дн.`;
	}
	if (!dueDate) return "без срока";
	const today = parseISODate(todayISO()).getTime();
	const target = parseISODate(dueDate).getTime();
	const diff = Math.round((target - today) / 86_400_000);
	if (diff < 0) return `просрочено ${formatDateShort(parseISODate(dueDate))}`;
	if (diff === 0) return "сегодня";
	if (diff === 1) return "завтра";
	return formatDateShort(parseISODate(dueDate));
}

export function deadlineTone(dueInDays?: number, dueDate?: string): "danger" | "warning" | "normal" {
	let diff: number | null = null;
	if (typeof dueInDays === "number") diff = dueInDays;
	else if (dueDate) {
		const today = parseISODate(todayISO()).getTime();
		diff = Math.round((parseISODate(dueDate).getTime() - today) / 86_400_000);
	}
	if (diff === null) return "normal";
	if (diff < 0) return "danger";
	if (diff <= 1) return "warning";
	return "normal";
}

export function formatDayName(isoDate: string, index: number): string {
	if (index === 0) return "Сегодня";
	if (index === 1) return "Завтра";
	return new Intl.DateTimeFormat(RU, { weekday: "short" }).format(parseISODate(isoDate));
}

export function formatMinutes(minutes: number): string {
	const whole = Math.max(0, Math.round(minutes));
	const hours = Math.floor(whole / 60);
	const rest = whole % 60;
	if (hours === 0) return `${rest} мин`;
	if (rest === 0) return `${hours} ч`;
	return `${hours} ч ${rest} мин`;
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

export function percent(value: number, total: number): number {
	if (total <= 0) return 0;
	return clamp((value / total) * 100, 0, 100);
}
