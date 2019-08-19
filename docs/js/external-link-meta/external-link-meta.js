class ExternalLinkMeta extends HTMLAnchorElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.api = 'https://domain-meta-extractor.mysterious-mountain.stream';

		this.fetchData();
	}

	async fetchData() {
		try {
			const metaDataResp = await fetch(this.api + '/meta/?url=' + window.encodeURIComponent(this.href));
			if (!metaDataResp.ok) {
				const metaDataErr = await metaDataResp.json();
				console.warn(metaDataErr);
				return;
			}

			const metaData = await metaDataResp.json();
			if (!metaData) {
				return;
			}

			this.render(metaData);
		} catch(err) {
			console.warn(err);
			return;
		}
	}

	async render(metaData) {
		if (!this.title && metaData.title) {
			this.title = metaData.title;
		}

		if (metaData.background_color == metaData.theme_color) {
			metaData.background_color = null;
			metaData.theme_color = null;
		}

		let left = this.offsetLeft + 15;
		if ((left + 400) > Math.max(document.documentElement.clientWidth, window.innerWidth || 0)) {
			left = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 500;
		}

		if (left < 0) {
			left = 0;
		}

		this.innerHTML += `
		<div class="external-link-meta" style="left: ${left}px; --elm-background_color: ${metaData.background_color || '#fff'}; --elm-theme_color: ${metaData.theme_color || '#000'};">
			<div class="external-link-meta__image"><img src="${(new URL(metaData.image, this.href).href)}"></div>
			<div class="external-link-meta__text">
				<div class="external-link-meta__title">${metaData.title || ''}</div>
				<div class="external-link-meta__description">${metaData.description || ''}</div>
				<div class="external-link-meta__logo"><img src="${this.api}/favicon/?url=${window.encodeURIComponent(this.href)}">${metaData.author || ''}</div>
			</div>
		</div>
		`;
	}
}

customElements.define('external-link-meta', ExternalLinkMeta, {extends: 'a'});

function trimPrefix(str, prefix) {
	if (str.startsWith(prefix)) {
		return str.slice(prefix.length)
	} else {
		return str
	}
}
