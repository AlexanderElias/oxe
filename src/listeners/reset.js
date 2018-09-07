import Binder from '../binder.js';
import Model from '../model.js';

export default function (e) {
	var element = e.target;
	var submit = element.getAttribute('o-submit') || element.getAttribute('data-o-submit');

	var binder = Binder.get({
		name: 'o-submit',
		element: element
	});

	var scope = binder.scope;

	if (submit) {
		var elements = element.querySelectorAll('[o-value]');
		var i = elements.length;

		while (i--) {

			var path = elements[i].getAttribute('o-value');
			var keys = [scope].concat(path.split('.'));

			Model.set(keys, '');

			Binder.unrender({
				name: 'o-value',
				element: elements[i]
			}, 'view');

		}

	}

}
