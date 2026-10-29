import { MAP_POINTS } from "$lib/content";
import { Widget } from "../widget.svelte";

export class MapWidget extends Widget {
	readonly type = "map" as const;
	selectedId = $state<string | null>(null);

	get selectedPoint() {
		return MAP_POINTS.find((point) => point.id === this.selectedId) ?? null;
	}

	select(id: string): void {
		this.selectedId = id;
	}

	serialize(): unknown {
		return {};
	}
}
