import Component from './component.js';
import General from './general.js';
import Utility from './utility.js';
import Batcher from './batcher.js';
import Fetcher from './fetcher.js';
import Methods from './methods.js';
import Router from './router.js';
import Loader from './loader.js';
import Binder from './binder.js';
import Keeper from './keeper.js';
import Wraper from './wraper.js';
import Model from './model.js';

import Reset from './listeners/reset.js';
import Input from './listeners/input.js';
import Submit from './listeners/submit.js';
import Change from './listeners/change.js';

const Oxe = Object.defineProperties({}, {
	compiled: {
		value: false
	},
	isSetup: {
		value: false
	},
	window: {
		enumerable: true,
		get: function () {
			return window;
		}
	},
	document: {
		enumerable: true,
		get: function () {
			return window.document;
		}
	},
	body: {
		enumerable: true,
		get: function () {
			return window.document.body;
		}
	},
	head: {
		enumerable: true,
		get: function () {
			return window.document.head;
		}
	},
	location: {
		enumerable: true,
		get: function () {
			return this.router.location;
		}
	},
	currentScript: {
		enumerable: true,
		get: function () {
			return (window.document._currentScript || window.document.currentScript);
		}
	},
	ownerDocument: {
		enumerable: true,
		get: function () {
			return (window.document._currentScript || window.document.currentScript).ownerDocument;
		}
	},
	global: {
		enumerable: true,
		value: {}
	},
	methods: {
		enumerable: true,
		value: Methods
	},
	utility: {
		enumerable: true,
		value: Utility
	},
	general: {
		enumerable: true,
		value: General
	},
	batcher: {
		enumerable: true,
		value: Batcher
	},
	loader: {
		enumerable: true,
		value: Loader
	},
	binder: {
		enumerable: true,
		value: Binder
	},
	fetcher: {
		enumerable: true,
		value: Fetcher
	},
	keeper: {
		enumerable: true,
		value: Keeper
	},
	component: {
		enumerable: true,
		value: Component
	},
	router: {
		enumerable: true,
		value: Router
	},
	model: {
		enumerable: true,
		value: Model
	},
	setup: {
		enumerable: true,
		value: async function (data) {
			const self = this;

			if (self.isSetup) {
				return;
			} else {
				self.isSetup = true;
			}

			Utility.ready(async function () {
				data = data || {};

				if (data.listener && data.listener.before) {
					await data.listener.before();
				}

				document.addEventListener('reset', Reset, true);
				document.addEventListener('input', Input, true);
				document.addEventListener('submit', Submit, true);
				document.addEventListener('change', Change, true);

				if (data.general) {
					await self.general.setup(data.general);
				}

				if (data.keeper) {
					await self.keeper.setup(data.keeper);
				}

				if (data.fetcher) {
					await self.fetcher.setup(data.fetcher);
				}

				if (data.loader) {
					await self.loader.setup(data.loader);
				}

				if (data.component) {
					await self.component.setup(data.component);
				}

				if (data.router) {
					await self.router.setup(data.router);
				}

				if (data.listener && data.listener.after) {
					await data.listener.after();
				}

			});
		}
	}
});

const eStyle = document.createElement('style');
const tStyle = document.createTextNode(' \
	o-router, o-router > :first-child { \
		display: block; \
	} \
	o-router, [o-scope] { \
		animation: o-transition 150ms ease-in-out; \
	} \
	@keyframes o-transition { \
		0% { opacity: 0; } \
		100% { opacity: 1; } \
	} \
');

eStyle.setAttribute('type', 'text/css');
eStyle.appendChild(tStyle);

document.head.appendChild(eStyle);

let currentCount = 0;
let requiredCount = 0;
let loadedCalled = false;

const loaded = function () {

	if (loadedCalled) return;
	if (currentCount !== requiredCount) return;

	loadedCalled = true;

	const element = document.querySelector('script[o-setup]');

	if (element) {

		const args = element.getAttribute('o-setup').split(/\s*,\s*/);
		const meta = document.querySelector('meta[name="oxe"]');

		if (meta && meta.hasAttribute('compiled')) {
			args[1] = 'null';
			args[2] = 'script';
			Oxe.compiled = true;
			Oxe.router.compiled = true;
			Oxe.component.compiled = true;
		}

		if (!args[0]) {
			throw new Error('Oxe - attribute o-setup requires a url');
		}

		if (args.length > 1) {
			Loader.load({
				url: args[0],
				method: args[2],
				transformer: args[1]
			});
		} else {
			const index = document.createElement('script');

			index.setAttribute('src', args[0]);
			index.setAttribute('async', 'true');
			index.setAttribute('type', 'module');

			element.insertAdjacentElement('afterend', index);
		}

	}

	document.registerElement('o-router', {
		prototype: Object.create(HTMLElement.prototype)
	});

};

if ('Promise' in window && 'fetch' in window) {
	loaded();
} else {
	requiredCount++;

	const polly = document.createElement('script');

	polly.setAttribute('async', 'true');
	polly.setAttribute('src', 'https://cdn.polyfill.io/v2/polyfill.min.js?features=fetch,promise');
	polly.addEventListener('load', function () {
		currentCount++;
		loaded();
	}, true);

	document.head.appendChild(polly);
}

if ('registerElement' in document && 'content' in document.createElement('template')) {
	loaded();
} else {
	requiredCount++;

	const polly = document.createElement('script');

	polly.setAttribute('async', 'true');
	polly.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/document-register-element/1.7.2/document-register-element.js');
	polly.addEventListener('load', function () {
		currentCount++;
		loaded();
	}, true);

	document.head.appendChild(polly);
}

export default Oxe;
