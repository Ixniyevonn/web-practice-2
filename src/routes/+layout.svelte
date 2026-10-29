<script lang="ts">
	import "leaflet/dist/leaflet.css";
	import "../app.css";
	import { site } from "$lib/content";

	let { children } = $props();
</script>

<svelte:head>
	<title>Путевой журнал — городской штаб в Санкт-Петербурге</title>
	<meta name="description" content={site.description} />
	<meta name="author" content={site.author} />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="ru_RU" />
	<meta property="og:site_name" content={site.title} />
	<meta property="og:title" content="Путевой журнал — городской штаб в Санкт-Петербурге" />
	<meta property="og:description" content={site.description} />
	<meta property="og:url" content={site.siteUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Путевой журнал" />
	<meta name="twitter:description" content={site.description} />
	<link rel="canonical" href={site.siteUrl} />
</svelte:head>

{@render children()}
