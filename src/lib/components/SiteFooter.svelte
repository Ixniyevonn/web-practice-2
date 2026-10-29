<script lang="ts">
	import { site } from "$lib/content";
	import Icon from "./Icon.svelte";
</script>

<footer class="site-footer">
	<div class="container">
		<div class="top">
			<div class="brand">
				<span class="mark" aria-hidden="true">ПЖ</span>
				<div>
					<strong>{site.title}</strong>
					<p>{site.subtitle}</p>
				</div>
			</div>

			<div class="col">
				<span class="caption">Автор</span>
				<strong>{site.author}</strong>
				<a href={`mailto:${site.email}`}><Icon name="mail" size={13} /> {site.email}</a>
				<a href={site.telegramUrl} target="_blank" rel="noreferrer">
					<Icon name="telegram" size={13} /> {site.telegram}
				</a>
				<a href={site.githubUrl} target="_blank" rel="noreferrer">
					<Icon name="github" size={13} /> {site.github}
				</a>
			</div>

			<div class="col">
				<span class="caption">Проект</span>
				<a href={site.repoUrl} target="_blank" rel="noreferrer">
					<Icon name="github" size={13} /> web-practice-2
				</a>
				<a href={site.siteUrl} target="_blank" rel="noreferrer">
					<Icon name="external" size={13} /> GitHub Pages
				</a>
				<span class="muted">SvelteKit · TypeScript</span>
			</div>
		</div>

		<div class="bottom">
			<span>© {site.year} {site.author}</span>
			<span class="muted">
				Данные: MET Norway · open.er-api.com · localStorage. Задачи, заметки, бюджет и
				карта — демо.
			</span>
			<span>Создано с помощью DeepSeek</span>
		</div>
	</div>
</footer>

<style>
	.site-footer {
		padding-block: 2rem 1.5rem;
		border-top: 1px solid var(--line);
		background: var(--bg-deep);
	}

	.top {
		display: grid;
		grid-template-columns: 1.3fr 1fr 1fr;
		gap: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--line);
	}

	.brand {
		display: flex;
		align-items: flex-start;
		gap: 0.7rem;
	}

	.mark {
		display: grid;
		place-items: center;
		width: 2.4rem;
		height: 2.4rem;
		flex-shrink: 0;
		border-radius: var(--radius);
		background: var(--blue);
		color: #fff;
		font-family: var(--f-mono);
		font-size: 0.7rem;
		font-weight: 600;
	}

	.brand strong {
		display: block;
		font-size: 0.95rem;
	}

	.brand p {
		margin: 0.1rem 0 0;
		color: var(--muted);
		font-size: 0.78rem;
	}

	.col {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.caption {
		margin-bottom: 0.15rem;
		color: var(--faint);
		font-size: 0.7rem;
	}

	.col strong {
		font-size: 0.82rem;
	}

	.col a {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		width: fit-content;
		color: var(--muted);
		font-size: 0.8rem;
	}

	.col a:hover {
		color: var(--blue);
	}

	.muted {
		color: var(--faint);
		font-size: 0.75rem;
	}

	.bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 1rem;
		color: var(--faint);
		font-size: 0.72rem;
	}

	.bottom .muted {
		max-width: 48ch;
		text-align: center;
	}

	@media (max-width: 820px) {
		.top {
			grid-template-columns: 1fr 1fr;
		}

		.brand {
			grid-column: 1 / -1;
		}

		.bottom {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.35rem;
		}

		.bottom .muted {
			text-align: left;
		}
	}

	@media (max-width: 520px) {
		.top {
			grid-template-columns: 1fr;
			gap: 1.2rem;
		}

		.brand {
			grid-column: auto;
		}
	}
</style>
