
export default {

	PATH: /\s*\|.*/,
	PREFIX: /(data-)?o-/,
	ROOT: /^(https?:)?\/?\//,
	TYPE: /(data-)?o-|-.*$/g,
	SPLIT_MODIFIERS: /\s|\s?,\s?/,

	binderNormalize (data) {
		return !data ? '' : data
			.replace(/\s+$/, '')
			.replace(/^\s+/, '')
			.replace(/\.{2,}/g, '.')
			.replace(/\|{2,}/g, '|')
			.replace(/\,{2,}/g, ',')
			.replace(/\s{2,}/g, ' ')
			.replace(/\s?\|\s?/, '|');
	},

	binderName (data) {
		return data.replace(this.PREFIX, '');
	},

	binderType (data) {
		return data.replace(this.TYPE, '');
	},

	binderNames (data) {
		return data.replace(this.PREFIX, '').split('-');
	},

	binderValues (data) {
		data = this.binderNormalize(data);
		var index = data.indexOf('|');
		return index === -1 ? data.split('.') : data.slice(0, index).split('.');
	},

	binderModifiers (data) {
		data = this.binderNormalize(data);
		var index = data.indexOf('|');
		return index === -1 ? [] : data.slice(index + 1).split(this.SPLIT_MODIFIERS);
	},

	binderPath (data) {
		return this.binderNormalize(data).replace(this.PATH, '');
	},

	ensureElement (data) {
		data.query = data.query || '';
		data.scope = data.scope || document.body;

		var element = data.scope.querySelector(`${data.name}${data.query}`);

		if (!element) {
			element = document.createElement(data.name);

			if (data.position === 'afterbegin') {
				data.scope.insertBefore(element, data.scope.firstChild);
			} else if (data.position === 'beforeend') {
				data.scope.appendChild(element);
			} else {
				data.scope.appendChild(element);
			}

		}

		for (var attribute of data.attributes) {
			element.setAttribute(attribute.name, attribute.value);
		}

		return element;
	},

	formData (form, model) {
		var elements = form.querySelectorAll('[o-value]');
		var data = {};

		var done = 0;
		var count = 0;

		for (var i = 0, l = elements.length; i < l; i++) {

			var element = elements[i];
			var path = element.getAttribute('o-value');

			if (!path) continue;

			path = path.replace(/\s*\|.*/, '');
			var name = path.split('.').slice(-1);

			data[name] = this.getByPath(model, path);
		}

		return data;
	},

	walker (node, callback) {
		callback(node);
		node = node.firstChild;
		while (node) {
		    this.walker(node, callback);
		    node = node.nextSibling;
		}
	},

	replaceEachVariable (element, variable, path, key) {
		var self = this;
		var iindex = '$index';
		var vindex = '$' + variable;
		var result = [];
		var pattern = new RegExp('\\$index|\\$' + variable, 'g');

		this.walker(element, function (node) {
			if (node.nodeType === 3) {
				if (node.nodeValue === vindex || node.nodeValue === iindex) {
					node.nodeValue = key;
				}
			} else if (node.nodeType === 1) {
				for (var i = 0, l = node.attributes.length; i < l; i++) {
					var attribute = node.attributes[i];
					attribute.value = attribute.value.replace(pattern, key);
					var name = attribute.name;
					var value = attribute.value.split(' ')[0].split('|')[0];
					if (name.indexOf('o-') === 0 || name.indexOf('data-o-') === 0) {
						if (value === variable || value.indexOf(variable) === 0) {
							attribute.value = path + '.' + key + attribute.value.slice(variable.length);
						}
					}
				}
			}
		});

	},

	traverse (data, path, callback) {
		var keys = typeof path === 'string' ? path.split('.') : path;
		var last = keys.length - 1;

		for (var i = 0; i < last; i++) {
			var key = keys[i];

			if (!(key in data)) {
				if (typeof callback === 'function') {
					callback(data, key, i, keys);
				} else {
					return undefined;
				}
			}

			data = data[key];
		}

		return {
			data: data,
			key: keys[last]
		}
	},

	setByPath (data, path, value) {
		var keys = typeof path === 'string' ? path.split('.') : path;
		var last = keys.length - 1;

		for (var i = 0; i < last; i++) {
			var key = keys[i];

			if (!(key in data)) {

				if (isNaN(keys[i+1])) {
					data[key] = {};
				} else {
					data[key] = [];
				}

			}

			data = data[key];
		}

		return data[keys[last]] = value;
	},

	getByPath (data, path) {
		var keys = typeof path === 'string' ? path.split('.') : path;
		var last = keys.length - 1;

		for (var i = 0; i < last; i++) {
			var key = keys[i];

			if (!(key in data)) {
				return undefined;
			} else {
				data = data[key];
			}

		}

		return data[keys[last]];
	},

	joinDot () {
		return Array.prototype.join
			.call(arguments, '.')
			.replace(/\.{2,}/g, '.');
	},

	// getScope (element) {
	//
	// 	if (!element) {
	// 		return;
	// 	}
	//
	// 	if (element.hasAttribute('o-scope') || element.hasAttribute('data-o-scope')) {
	// 		return element;
	// 	}
	//
	// 	if (element.parentNode) {
	// 		return this.getScope(element.parentNode);
	// 	}
	//
	// 	// console.warn('Oxe.utility - could not find container scope');
	// },

	// ready () {
	// 	return new Promise(function (resolve) {
	// 		if (window.document.readyState !== 'interactive' && window.document.readyState !== 'complete') {
	// 			window.document.addEventListener('DOMContentLoaded', resolve, true);
	// 		} else {
	// 			resolve();
	// 		}
	// 	});
	// }
	ready (callback) {
		callback = Wraper(callback);
		if (window.document.readyState !== 'interactive' && window.document.readyState !== 'complete') {
			window.document.addEventListener('DOMContentLoaded', callback, true);
		} else {
			callback();
		}
	}

}
