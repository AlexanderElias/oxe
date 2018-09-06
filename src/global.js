import Component from './component.js';
import General from './general.js';
import Utility from './utility.js';
import Batcher from './batcher.js';
import Fetcher from './fetcher.js';
import Router from './router.js';
import Loader from './loader.js';
import Binder from './binder.js';
import Keeper from './keeper.js';
import Model from './model.js';

const Global = {
	compiled: false
};

Object.defineProperties(Global, {
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
		value: {
			data: {}
		}
	},
	utility: {
		enumerable: true,
		value: Utility
	},
	setup: {
		enumerable: true,
		value: function (data) {
			Global.utility.ready(function () {

				if (this._setup) {
					return;
				} else {
					this._setup = true;
				}

				data = data || {};

				if (data.listener && data.listener.before) {
					data.listener.before();
				}

				if (data.general) {
					this.general.setup(data.general);
				}

				if (data.keeper) {
					this.keeper.setup(data.keeper);
				}

				if (data.fetcher) {
					this.fetcher.setup(data.fetcher);
				}

				if (data.loader) {
					this.loader.setup(data.loader);
				}

				if (data.component) {
					this.component.setup(data.component);
				}

				if (data.router) {
					this.router.setup(data.router);
				}

				if (data.listener && data.listener.after) {
					data.listener.after();
				}

			});
		}
	}
});

Object.defineProperty(Global, 'general', {
	enumerable: true,
	value: new General()
});

Object.defineProperty(Global, 'batcher', {
	enumerable: true,
	value: new Batcher()
});

Object.defineProperty(Global, 'loader', {
	enumerable: true,
	value: new Loader()
});

Object.defineProperty(Global, 'binder', {
	enumerable: true,
	value: new Binder()
});

Object.defineProperty(Global, 'fetcher', {
	enumerable: true,
	value: new Fetcher()
});

Object.defineProperty(Global, 'keeper', {
	enumerable: true,
	value: new Keeper()
});

Object.defineProperty(Global, 'component', {
	enumerable: true,
	value: new Component()
});

Object.defineProperty(Global, 'router', {
	enumerable: true,
	value: new Router()
});

Object.defineProperty(Global, 'model', {
	enumerable: true,
	value: new Model()
});

export default Global;
