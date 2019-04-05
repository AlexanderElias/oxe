import Utility from '../utility.js';
import Fetcher from '../fetcher.js';
import Methods from '../methods.js';
import Model from '../model.js';
import Binder from '../binder.js';
// import View from '../view.js';

export default async function (event) {

	const node = event.target;

	const binder = Binder.get('attribute', node, 'o-submit');
	// const binder = View.get('attribute', node, 'o-submit');

	let method = Methods.get(binder.keys);
	let model = Model.get(binder.scope);
	let data = Utility.formData(node, model);

	let options = await method.call(binder.container, data, event);

	if (typeof options === 'object') {
		let oaction = node.getAttribute('o-action');
		let omethod = node.getAttribute('o-method');
		let oenctype = node.getAttribute('o-enctype');

		options.url = options.url || oaction;
		options.method = options.method || omethod;
		options.contentType = options.contentType || oenctype;

		let result = await Fetcher.fetch(options);

		if (options.handler) {
			await options.handler(result);
		}

	}

	if (node.hasAttribute('o-reset') || (typeof options === 'object' && options.reset)) {
		node.reset();
	}

};
