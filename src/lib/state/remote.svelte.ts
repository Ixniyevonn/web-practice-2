import { errorMessage } from "$lib/core/http";
import { Widget } from "./widget.svelte";

export type RemoteStatus = "idle" | "loading" | "ready" | "error";

/**
 * Shared state machine for widgets backed by a network request.
 * A failed request is local to the widget, so other cards keep working.
 */
export abstract class RemoteWidget<T> extends Widget {
	data = $state<T | null>(null);
	status = $state<RemoteStatus>("idle");
	error = $state("");
	usingCache = $state(false);
	updatedAt = $state<number | null>(null);

	protected controller: AbortController | null = null;
	protected alive = true;

	abstract load(): Promise<void>;

	override destroy(): void {
		this.alive = false;
		this.controller?.abort();
	}

	protected begin(): AbortController {
		this.controller?.abort();
		const controller = new AbortController();
		this.controller = controller;
		this.status = "loading";
		this.error = "";
		return controller;
	}

	protected succeed(data: T, updatedAt = Date.now()): void {
		if (!this.alive) return;
		this.data = data;
		this.updatedAt = updatedAt;
		this.usingCache = false;
		this.status = "ready";
		this.error = "";
	}

	protected fail(error: unknown, fallback: string): void {
		if (!this.alive) return;
		this.status = "error";
		this.error = errorMessage(error) || fallback;
		this.usingCache = Boolean(this.data);
	}
}
