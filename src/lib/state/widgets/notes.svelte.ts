import { DEMO_NOTES, type Note } from "$lib/content";
import { uid } from "$lib/core/format";
import { Widget } from "../widget.svelte";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function normalizeNote(value: unknown): Note | null {
	if (!isRecord(value)) return null;
	if (typeof value.id !== "string" || typeof value.title !== "string") return null;
	if (typeof value.text !== "string") return null;
	return {
		id: value.id,
		title: value.title,
		text: value.text,
		...(typeof value.place === "string" ? { place: value.place } : {}),
		...(typeof value.daysAgo === "number" ? { daysAgo: value.daysAgo } : {}),
		...(typeof value.createdAt === "string" ? { createdAt: value.createdAt } : {}),
		...(value.demo ? { demo: true } : {})
	};
}

function noteTimestamp(note: Note): number {
	if (note.createdAt) return new Date(note.createdAt).getTime();
	if (typeof note.daysAgo === "number") return Date.now() - note.daysAgo * 86_400_000;
	return 0;
}

export class NotesWidget extends Widget {
	readonly type = "notes" as const;
	notes = $state<Note[]>([]);

	constructor(onChange: () => void) {
		super(onChange);
		this.notes = structuredClone(DEMO_NOTES);
	}

	get sortedNotes(): Note[] {
		return [...this.notes].sort((left, right) => noteTimestamp(right) - noteTimestamp(left));
	}

	addNote(title: string, text: string, place: string): boolean {
		const cleanTitle = title.trim();
		const cleanText = text.trim();
		if (!cleanTitle || !cleanText) return false;
		this.notes.unshift({
			id: uid("note"),
			title: cleanTitle,
			text: cleanText,
			...(place.trim() ? { place: place.trim() } : {}),
			createdAt: new Date().toISOString()
		});
		this.requestSave();
		return true;
	}

	removeNote(id: string): void {
		const index = this.notes.findIndex((note) => note.id === id);
		if (index < 0) return;
		this.notes.splice(index, 1);
		this.requestSave();
	}

	serialize(): unknown {
		return { notes: this.notes.map((note) => ({ ...note })) };
	}

	override hydrate(data: unknown): void {
		if (!isRecord(data) || !Array.isArray(data.notes)) return;
		this.notes = data.notes
			.map(normalizeNote)
			.filter((note): note is Note => note !== null);
	}
}
