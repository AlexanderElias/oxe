import Utility from '../utility.js';
import Fetcher from '../fetcher.js';
import Wraper from '../wraper.js';
import Binder from '../binder.js';
import Model from '../model.js';

export default function (e) {
	var element = e.target;
	var submit = element.getAttribute('o-submit') || element.getAttribute('data-o-submit');

	if (!submit) return;

	e.preventDefault();

	var binder = Binder.get({
		name: 'o-submit',
		element: element
	});

	var sScope = binder.scope;
	var eScope = binder.container;
	var model = Model.data[sScope];

	var data = Utility.formData(element, model);
	var method = Utility.getByPath(eScope.methods, submit);

	var done = function (options) {
		if (options && typeof options === 'object') {
			var auth = element.getAttribute('o-auth') || element.getAttribute('data-o-auth');
			var action = element.getAttribute('o-action') || element.getAttribute('data-o-action');
			var method = element.getAttribute('o-method') || element.getAttribute('data-o-method');
			var enctype = element.getAttribute('o-enctype') || element.getAttribute('data-o-enctype');

			options.url = options.url || action;
			options.method = options.method || method;
			options.auth = options.auth === undefined || options.auth === null ? auth : options.auth;
			options.contentType = options.contentType === undefined || options.contentType === null ? enctype : options.contentType;

			Fetcher.fetch(options);
		}

		if (
			(
				options &&
				typeof options === 'object' &&
				options.reset
			)
			|| element.hasAttribute('o-reset')
		) {
			element.reset();
		}
	};

	Wraper(method.bind(eScope, data, e), done);
}
