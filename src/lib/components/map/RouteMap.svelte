<script lang="ts">
	import { onMount } from "svelte";
	import type { DivIcon, LatLngBounds, Map as LeafletMap, Marker } from "leaflet";
	import { MAP_POINTS, type MapPoint } from "$lib/content";

	let {
		points = MAP_POINTS,
		selectedId,
		fitToken = 0,
		onSelect
	}: {
		points?: MapPoint[];
		selectedId: string | null;
		fitToken?: number;
		onSelect: (id: string) => void;
	} = $props();

	type LeafletModule = typeof import("leaflet");

	let container = $state<HTMLDivElement>();
	let map: LeafletMap | null = null;
	let mapBounds: LatLngBounds | null = null;
	let markers = new Map<string, Marker>();
	let resizeObserver: ResizeObserver | null = null;

	function fitAll(): void {
		if (!map || !mapBounds) return;
		map.flyToBounds(mapBounds, { padding: [24, 24], duration: 0.35 });
	}

	function markerIcon(L: LeafletModule, index: number): DivIcon {
		return L.divIcon({
			className: "map-pin",
			html: `<span>${index + 1}</span>`,
			iconSize: [28, 28],
			iconAnchor: [14, 14]
		});
	}

	function updateSelection(id: string | null): void {
		for (const [key, marker] of markers) {
			marker.getElement()?.classList.toggle("selected", key === id);
		}
		const selected = id ? markers.get(id) : null;
		if (!selected || !map) return;
		map.flyTo(selected.getLatLng(), Math.max(map.getZoom(), 16), { duration: 0.4 });
	}

	onMount(() => {
		if (!container) return;
		let disposed = false;
		let instance: LeafletMap | null = null;

		void (async () => {
			const loaded = (await import("leaflet")) as LeafletModule & {
				default?: LeafletModule;
			};
			const L = loaded.default ?? loaded;
			if (disposed || !container) return;

			instance = L.map(container, {
				center: [59.94, 30.315],
				zoom: 14,
				zoomControl: false,
				scrollWheelZoom: false
			});

			L.tileLayer(
				"https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
				{
					maxZoom: 19,
					detectRetina: true,
					attribution:
						'Tiles &copy; Esri &mdash; Source: Esri, HERE, Garmin, USGS, OpenStreetMap contributors'
				}
			).addTo(instance);

			L.control.zoom({ position: "topright" }).addTo(instance);

			const latlngs = points.map((point) => L.latLng(point.lat, point.lon));

			points.forEach((point, index) => {
				const marker = L.marker([point.lat, point.lon], {
					icon: markerIcon(L, index),
					title: point.name,
					alt: point.name
				}).addTo(instance!);
				marker.on("click", () => onSelect(point.id));
				markers.set(point.id, marker);
			});

			if (latlngs.length > 1) {
				mapBounds = L.latLngBounds(latlngs).pad(0.2);
				instance.fitBounds(mapBounds, { padding: [24, 24] });
			}

			map = instance;
			resizeObserver = new ResizeObserver(() => instance?.invalidateSize());
			resizeObserver.observe(container);
			updateSelection(selectedId);
		})();

		return () => {
			disposed = true;
			resizeObserver?.disconnect();
			instance?.remove();
			map = null;
			markers.clear();
		};
	});

	$effect(() => {
		const id = selectedId;
		if (map) updateSelection(id);
	});

	$effect(() => {
		const token = fitToken;
		void token;
		if (map) fitAll();
	});
</script>

<div class="map-shell" bind:this={container} aria-label="Карта центра Петербурга с точками прогулки"></div>

<style>
	.map-shell {
		width: 100%;
		height: 340px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: #eef2f5;
		overflow: hidden;
	}

	.map-shell :global(.leaflet-container) {
		width: 100%;
		height: 100%;
		font-family: var(--f-sans);
		background: #eef2f5;
	}

	.map-shell :global(.leaflet-control-attribution) {
		font-size: 9px;
		background: rgba(255, 255, 255, 0.82);
	}

	.map-shell :global(.leaflet-control-attribution a) {
		color: var(--muted);
	}

	.map-shell :global(.map-pin) {
		display: grid;
		place-items: center;
		border: 2px solid var(--blue);
		border-radius: 50%;
		background: #fff;
		color: var(--ink);
		box-shadow: 0 3px 8px rgba(16, 19, 24, 0.22);
		font-family: var(--f-mono);
		font-size: 11px;
		font-weight: 500;
	}

	.map-shell :global(.map-pin.selected) {
		background: var(--blue);
		color: #fff;
		box-shadow:
			0 0 0 4px rgba(29, 79, 255, 0.18),
			0 3px 8px rgba(16, 19, 24, 0.24);
	}

	.map-shell :global(.map-pin span) {
		line-height: 1;
	}

	@media (max-width: 620px) {
		.map-shell {
			height: 300px;
		}
	}
</style>
