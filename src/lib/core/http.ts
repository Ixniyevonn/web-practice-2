export class HttpError extends Error {
	readonly status?: number;

	constructor(message: string, status?: number) {
		super(message);
		this.name = "HttpError";
		this.status = status;
	}
}

export async function fetchJson<T>(
	url: string,
	signal?: AbortSignal,
	timeoutMs = 12_000
): Promise<T> {
	const controller = new AbortController();
	let timedOut = false;
	const timer = setTimeout(() => {
		timedOut = true;
		controller.abort();
	}, timeoutMs);

	const forwardAbort = () => controller.abort();
	signal?.addEventListener("abort", forwardAbort, { once: true });

	try {
		const response = await fetch(url, {
			signal: controller.signal,
			headers: { Accept: "application/json" }
		});
		if (!response.ok) {
			throw new HttpError(`Сервис ответил с ошибкой ${response.status}.`, response.status);
		}
		return (await response.json()) as T;
	} catch (error) {
		if (signal?.aborted) throw new DOMException("Запрос отменён.", "AbortError");
		if (timedOut) throw new HttpError("Сервис не ответил вовремя.");
		throw error;
	} finally {
		clearTimeout(timer);
		signal?.removeEventListener("abort", forwardAbort);
	}
}

export function errorMessage(error: unknown): string {
	if (error instanceof DOMException && error.name === "AbortError") return "Запрос отменён.";
	if (error instanceof HttpError) return error.message;
	if (error instanceof TypeError) return "Нет связи с сервисом. Проверьте интернет и повторите.";
	if (error instanceof Error) return error.message;
	return "Не удалось получить данные.";
}
