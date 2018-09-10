import Methods from './methods.js';
import Binder from './binder.js';
import Model from './model.js';

class Component {

	constructor (options) {
		this.data = {};
		this.setup(options);
	}

	async setup (options) {
		options = options || {};

		if (options.components) {
			return Promise.all(options.components.map(this.define);
		}

	}

	renderSlot (target, source) {
		var targetSlots = target.querySelectorAll('slot[name]');

		for (var targetSlot of targetSlots) {

			var name = targetSlot.getAttribute('name');
			var sourceSlot = source.querySelector('[slot="'+ name + '"]');

			if (sourceSlot) {
				targetSlot.parentNode.replaceChild(sourceSlot, targetSlot);
			} else {
				targetSlot.parentNode.removeChild(targetSlot);
			}

		}

		var defaultSlot = target.querySelector('slot:not([name])');

		if (defaultSlot && source.children.length) {
			while (source.firstChild) {
				defaultSlot.parentNode.insertBefore(source.firstChild, defaultSlot);
			}
		}

		if (defaultSlot) {
			defaultSlot.parentNode.removeChild(defaultSlot);
		}

	}

	renderTemplate (template) {
		var fragment = document.createDocumentFragment();

		if (template) {
			if (typeof template === 'string') {
				var temporary = document.createElement('div');

				temporary.innerHTML = template;

				while (temporary.firstChild) {
					fragment.appendChild(temporary.firstChild);
				}

			} else {
				fragment.appendChild(template);
			}
		}

		return fragment;
	}

	renderStyle (style, scope) {

		if (!style) return;

		if (window.CSS && window.CSS.supports) {

			if (!window.CSS.supports('(--t: black)')) {
				var matches = style.match(/--\w+(?:-+\w+)*:\s*.*?;/g);

				for (var match of matches) {

					var rule = match.match(/(--\w+(?:-+\w+)*):\s*(.*?);/);
					var pattern = new RegExp('var\\('+rule[1]+'\\)', 'g');

					style = style.replace(rule[0], '');
					style = style.replace(pattern, rule[2]);

				}

			}

			if (!window.CSS.supports(':scope')) {
				style = style.replace(/\:scope/g, '[o-scope="' + scope + '"]');
			}

			if (!window.CSS.supports(':host')) {
				style = style.replace(/\:host/g, '[o-scope="' + scope + '"]');
			}

		}

		var estyle = document.createElement('style');
		var nstyle = document.createTextNode(style);

		estyle.appendChild(nstyle);

		return estyle;
	}

	created (element, options) {
		var self = this;
		var scope = options.name + '-' + options.count++;

		Object.defineProperties(element, {
			scope: {
				enumerable: true,
				value: scope
			},
			status: {
				enumerable: true,
				value: 'created'
			}
		});

		element.setAttribute('o-scope', scope);

		Model.set(scope, options.model || {});
		Methods.data[scope] = options.methods;

		if (!self.compiled || (self.compiled && element.parentNode.nodeName !== 'O-ROUTER')) {
			var eTemplate = self.renderTemplate(options.template);
			var eStyle = self.renderStyle(options.style, scope);

			if (eStyle) {
				eTemplate.insertBefore(eStyle, eTemplate.firstChild);
			}

			if (options.shadow && 'attachShadow' in document.body) {
				element.attachShadow({ mode: 'open' }).appendChild(eTemplate);
			} else if (options.shadow && 'createShadowRoot' in document.body) {
				element.createShadowRoot().appendChild(eTemplate);
			} else {
				self.renderSlot(eTemplate, element);
				element.appendChild(eTemplate);
			}

		}

		Binder.bind(element);

		if (options.created) {
			options.created.call(element);
		}

	}

	attached (element, options) {
		// Binder.bind(element);

		if (options.attached) {
			options.attached.call(element);
		}
	}

	detached (element, options) {
		// Binder.unbind(element);

		if (options.detached) {
			options.detached.call(element);
		}
	}

	async define (options) {
		const self = this;

		if (!options.name) {
			throw new Error('Oxe.component.define - requires name');
		}

		if (options.name in self.data) {
			throw new Error('Oxe.component.define - component defined');
		}

		self.data[options.name] = options;

		options.count = 0;
		options.compiled = false;
		options.model = options.model || {};
		options.shadow = options.shadow || false;
		options.template = options.template || '';
		options.properties = options.properties || {};

		options.properties.status = {
			enumerable: true,
			configurable: true,
			value: 'define'
		};

		options.properties.model = {
			enumerable: true,
			configurable: true,
			get: function () {
				return Model.get(this.scope);
			},
			set: function (data) {
				data = data && typeof data === 'object' ? data : {};
				return Model.set(this.scope, data);
			}
		};

		options.properties.methods = {
			enumerable: true,
			get: function () {
				return Methods.data[this.scope];
			}
		};

		options.proto = Object.create(HTMLElement.prototype, options.properties);

		options.proto.attributeChangedCallback = options.attributed;

		options.proto.createdCallback = function () {
			self.created(this, options);
		};

		options.proto.attachedCallback = function () {
			self.attached(this, options);
		};

		options.proto.detachedCallback = function () {
			self.detached(this, options);
		};

		return document.registerElement(options.name, {
			prototype: options.proto
		});

	}

}

export default new Component();
