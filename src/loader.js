import Transformer from './transformer.js';
import Events from './events.js';
import Path from './path.js';

class Loader extends Events {

	constructor () {
		super();

		this.data = {};
		this.ran = false;
		this.methods = {};
		this.transformers = {};

		document.addEventListener('load', this.listener.bind(this), true);
	}

	async setup (options) {
		options = options || {};

		this.methods = options.methods || this.methods;
		this.transformers = options.transformers || this.transformers;

		if (options.loads) {
			var load;
			while (load = options.loads.shift()) {
				this.load(load);
			}
		}

	}

	execute (data) {
		var text = '\'use strict\';\n\n' + (data.ast ? data.ast.cooked : data.text);
		var code = new Function('$LOADER', 'window', text);
		data.result = code(this, window);
	}

	ready (data) {
		if (data && data.listener && data.listener.length) {
			var listener;
			while (listener = data.listener.shift()) {
				listener(data);
			}
		}
	}

	fetch (data) {
		var self = this;
		var fetch = new XMLHttpRequest();

		fetch.onreadystatechange = function () {

			if (fetch.readyState === 4) {

				if (fetch.status >= 200 && fetch.status < 300 || fetch.status == 304) {
					data.text = fetch.responseText;

					if (data.extension === 'js') {

						if (data.transformer) {
							self.transform(data, function () {
								self.execute(data);
								self.ready(data);
							});
						} else {
							self.execute(data);
							self.ready(data);
						}

					} else {
						self.ready(data);
					}

				} else {
					throw new Error(fetch.responseText);
				}

			}

		};

		fetch.open('GET', data.url);
		fetch.send();
	}

	transform (data, callback) {

		if (data.transformer === 'es' || data.transformer === 'est') {
			data.text = Transformer.template(data.text);
		}

		if (data.transformer === 'es' || data.transformer === 'esm') {
			data.ast = Transformer.ast(data);
		}

		if (data.ast && data.ast.imports.length) {

			var count = 0;
			var total = data.ast.imports.length;

			var listener = function () {
				count++;

				if (count === total) {
					callback();
				}

			};

			for (var i = 0; i < total; i++) {
				this.load({
					listener: listener,
					method: data.method,
					url: data.ast.imports[i].url,
					transformer: data.transformer
				});
			}

		} else {
			callback();
		}

	}

	attach (data) {
		var element = document.createElement(data.tag);

		data.attributes['o-load'] = 'true';

		for (var name in data.attributes) {
			element.setAttribute(name, data.attributes[name]);
		}

		document.head.appendChild(element);
	}

	js (data) {
		if (
			data.method === 'fetch'
			|| data.transformer === 'es'
			|| data.transformer === 'est'
			|| data.transformer === 'esm'
		) {
			this.fetch(data);
		} else if (data.method === 'script') {
			this.attach({
				tag: 'script',
				attributes: {
					type: 'text/javascript',
					src: data.url,
					async: 'true',
				}
			});
		} else {
			this.attach({
				tag: 'script',
				attributes: {
					type: 'module',
					src: data.url,
					async: 'true',
				}
			});
		}
	}

	css (data) {
		if (data.method === 'fetch') {
			this.fetch(data);
		} else {
			this.attach({
				tag: 'link',
				attributes: {
					href: data.url,
					type: 'text/css',
					rel: 'stylesheet'
				}
			});
		}
	}

	load (data, listener) {

		if (typeof data === 'string') {
			data = { url: data };
		} else {
			listener = data.listener;
		}

		data.url = Path.resolve(data.url);

		if (data.url in this.data) {
			var load = this.data[data.url];

			if (load.listener.length) {

				if (listener) {
					load.listener.push(listener);
				}

			} else {

				if (listener) {
					load.listener.push(listener);
				}

				this.ready(load);
			}

			return;
		}

		this.data[data.url] = data;

		data.extension = data.extension || Path.extension(data.url);

		data.listener = listener ? [listener] : [];
		data.method = data.method || this.methods[data.extension];
		data.transformer = data.transformer || this.transformers[data.extension];

		if (data.extension === 'js') {
			this.js(data);
		} else if (data.extension === 'css') {
			this.css(data);
		} else {
			this.fetch(data);
		}

	}

	listener (e) {
		var element = e.target;

		if (element.nodeType !== 1 || !element.hasAttribute('o-load')) {
			return;
		}

		var path = Path.resolve(element.src || element.href);
		var load = this.data[path];

		this.ready(load);
	}

}

export default new Loader();

/*
	https://www.nczonline.net/blog/2013/06/25/eval-isnt-evil-just-misunderstood/
*/
