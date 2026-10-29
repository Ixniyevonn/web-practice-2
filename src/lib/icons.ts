export type IconName =
	| "plus"
	| "minus"
	| "close"
	| "check"
	| "chevron-down"
	| "chevron-up"
	| "arrow-up"
	| "arrow-down"
	| "arrow-right"
	| "arrow-up-right"
	| "grip"
	| "trash"
	| "refresh"
	| "clock"
	| "sun"
	| "moon"
	| "cloud"
	| "cloud-sun"
	| "fog"
	| "drizzle"
	| "rain"
	| "snow"
	| "storm"
	| "wind"
	| "droplet"
	| "thermometer"
	| "calendar"
	| "wallet"
	| "ruble"
	| "note"
	| "map"
	| "route"
	| "pin"
	| "fit"
	| "zoom-in"
	| "zoom-out"
	| "swap"
	| "external"
	| "mail"
	| "telegram"
	| "github"
	| "alert"
	| "info"
	| "copy"
	| "spark"
	| "filter"
	| "flag"
	| "building"
	| "museum"
	| "water"
	| "park"
	| "monument"
	| "settings"
	| "database"
	| "lock"
	| "globe"
	| "layers"
	| "menu";

export const iconPaths: Record<IconName, string[]> = {
	plus: ["M12 4v16M4 12h16"],
	minus: ["M4 12h16"],
	close: ["M5 5l14 14M19 5 5 19"],
	check: ["m4 12 5 5L20 6"],
	"chevron-down": ["m6 9 6 6 6-6"],
	"chevron-up": ["m6 15 6-6 6 6"],
	"arrow-up": ["M12 20V4M6 10l6-6 6 6"],
	"arrow-down": ["M12 4v16M6 14l6 6 6-6"],
	"arrow-right": ["M4 12h15M13 6l6 6-6 6"],
	"arrow-up-right": ["M6 18 18 6M8 6h10v10"],
	grip: ["M9 5h1M14 5h1M9 12h1M14 12h1M9 19h1M14 19h1"],
	trash: ["M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"],
	refresh: ["M20 12a8 8 0 1 1-2.3-5.7M20 4v6h-6"],
	clock: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2"],
	sun: [
		"M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
		"M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"
	],
	moon: ["M20 15.4A8.5 8.5 0 0 1 8.6 4 8.5 8.5 0 1 0 20 15.4Z"],
	cloud: ["M7 18h10a4 4 0 0 0 .6-7.9A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18Z"],
	"cloud-sun": [
		"M12 3v2M4.5 5.5l1.4 1.4M3 12h2M18 6a4 4 0 0 1 4 4",
		"M16 18h3a3 3 0 0 0 .3-6A5 5 0 0 0 9 11a3.5 3.5 0 0 0 1 7h6Z"
	],
	fog: ["M4 9h16M3 13h18M5 17h14"],
	drizzle: [
		"M7 16h10a4 4 0 0 0 .6-7.9A6 6 0 0 0 6 7.5 4.3 4.3 0 0 0 7 16Z",
		"M8 19l-1 2M12 19l-1 2M16 19l-1 2"
	],
	rain: [
		"M7 16h10a4 4 0 0 0 .6-7.9A6 6 0 0 0 6 7.5 4.3 4.3 0 0 0 7 16Z",
		"M8 18l-1 3M12 18l-1 3M16 18l-1 3"
	],
	snow: [
		"M7 15h10a4 4 0 0 0 .6-7.9A6 6 0 0 0 6 6.5 4.3 4.3 0 0 0 7 15Z",
		"M8 19h.01M12 21h.01M16 19h.01"
	],
	storm: [
		"M7 15h10a4 4 0 0 0 .6-7.9A6 6 0 0 0 6 6.5 4.3 4.3 0 0 0 7 15Z",
		"M13 17l-2 4h3l-2 3"
	],
	wind: ["M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"],
	droplet: ["M12 3s6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 6-10 6-10Z"],
	thermometer: ["M10 4a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0V4ZM12 8v8"],
	calendar: ["M4 6h16v15H4zM4 10h16M8 3v4M16 3v4"],
	wallet: ["M4 6h16v13H4zM4 9h16M15 13h5v4h-5z"],
	ruble: ["M8 4v16M8 4h5a4 4 0 0 1 0 8H8M6 12h10M6 16h8"],
	note: ["M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"],
	map: ["M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6ZM9 3v15M15 6v15"],
	route: [
		"M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
		"M8 16h5a4 4 0 0 0 0-8H9"
	],
	pin: ["M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z", "M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
	fit: ["M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"],
	"zoom-in": ["M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM16 16l5 5M11 8v6M8 11h6"],
	"zoom-out": ["M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM16 16l5 5M8 11h6"],
	swap: ["M4 8h13l-3-3M20 16H7l3 3"],
	external: ["M14 4h6v6M20 4l-9 9M18 13v7H4V6h7"],
	mail: ["M3 5h18v14H3zM3 6l9 7 9-7"],
	telegram: ["M21 4 3 11l6 2 2 6 3-4 5 3 2-14Z"],
	github: [
		"M9 19c-4 1-4-2-6-3m12 6v-4.2c0-1.1.1-1.5-.5-2.1 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.3 1.3a11.4 11.4 0 0 0-6 0C5.9 1.9 4.9 2.2 4.9 2.2a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 3.5 8.7c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2.1V21"
	],
	alert: ["M12 3 2 21h20L12 3ZM12 9v5M12 17h.01"],
	info: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 11v5M12 8h.01"],
	copy: ["M8 8h11v12H8zM5 16H4V4h11v1"],
	spark: ["M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4"],
	filter: ["M4 5h16l-6 7v6l-4 2v-8L4 5Z"],
	flag: ["M5 21V4h13l-2 4 2 4H5"],
	building: ["M4 21V5h10v16M14 10h6v11M7 8h2M7 12h2M7 16h2M17 13h1M17 17h1"],
	museum: ["M3 10 12 4l9 6M4 10h16M5 10v9M9 10v9M15 10v9M19 10v9M3 21h18"],
	water: ["M3 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"],
	park: ["M12 3 6 13h4l-3 5h10l-3-5h4L12 3ZM12 18v3"],
	monument: ["M12 3v3M9 6h6l-1 4h-4L9 6ZM7 21h10M10 10v8M14 10v8"],
	settings: [
		"M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
		"M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"
	],
	database: [
		"M12 3c5 0 8 1.3 8 3s-3 3-8 3-8-1.3-8-3 3-3 8-3ZM4 6v12c0 1.7 3 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3 3 8 3s8-1.3 8-3"
	],
	lock: ["M6 10h12v11H6zM8 10V7a4 4 0 0 1 8 0v3M12 14v3"],
	globe: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"],
	layers: ["M12 3 2 9l10 6 10-6-10-6ZM2 15l10 6 10-6"],
	menu: ["M3 6h18M3 12h18M3 18h18"]
};
