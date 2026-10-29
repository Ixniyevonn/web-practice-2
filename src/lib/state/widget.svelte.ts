import type { WidgetType } from "$lib/content";

/**
 * Base class for every dashboard widget.
 *
 * The class owns the widget state and persistence contract. Svelte components
 * only render that state, while `Dashboard` manages the collection.
 */
export abstract class Widget {
	abstract readonly type: WidgetType;

	protected readonly onChange: () => void;

	constructor(onChange: () => void) {
		this.onChange = onChange;
	}

	abstract serialize(): unknown;

	hydrate(_data: unknown): void {
		/* Widgets without persisted state use the default implementation. */
	}

	destroy(): void {
		/* Timers and requests are released by subclasses. */
	}

	requestSave(): void {
		this.onChange();
	}
}
