class ExternalLinkMeta extends HTMLAnchorElement {
	constructor() {
		super();
	}

	connectedCallback() {
		let sourceURL = trimPrefix(this.href, 'https://');
		sourceURL = trimPrefix(sourceURL, 'http://');
		sourceURL = trimPrefix(sourceURL, '//');

		this.sourceURL = sourceURL;

		this.fetchData();
	}

	async fetchData() {
		try {
			const metaDataRaw = await fetch('https://domain-meta-extractor.mysterious-mountain.stream/meta/' + this.sourceURL);
			const metaData = await metaDataRaw.json();
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

		if (metaData.image) {
			this.innerHTML += `
			<div class="external-link-meta" style="--elm-background_color: ${metaData.background_color || '#fff'}; --elm-theme_color: ${metaData.theme_color || '#000'};">
				<div class="external-link-meta__image"><img src="${new URL(metaData.image, this.href).href}"></div>
				<div class="external-link-meta__description"><p>${metaData.description}</p></div>
			</div>
			`;
		} else {
			this.innerHTML += `
			<div class="external-link-meta" style="--elm-background_color: ${metaData.background_color || '#fff'}; --elm-theme_color: ${metaData.theme_color || '#000'};">
				<div class="external-link-meta__description"><p>${metaData.description}</p></div>
			</div>
			`;
		}

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
