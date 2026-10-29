import { Widget } from "../widget.svelte";

export class ClockWidget extends Widget {
	readonly type = "clock" as const;
	now = $state<Date | null>(null);
	private timer: number | null = null;

	start(): void {
		if (this.timer !== null) return;
		this.now = new Date();
		this.timer = window.setInterval(() => {
			this.now = new Date();
		}, 1000);
	}

	override destroy(): void {
		if (this.timer !== null) {
			window.clearInterval(this.timer);
			this.timer = null;
		}
	}

	serialize(): unknown {
		return {};
	}
}
