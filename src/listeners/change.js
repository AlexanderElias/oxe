import Binder from '../binder.js';

export default function (e) {
	if (e.target.hasAttribute('o-value')) {

		var binder = Binder.get({
			name: 'o-value',
			element: e.target,
		});

		Binder.render(binder);
	}
}
