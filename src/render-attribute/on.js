import Methods from '../methods.js';
import Binder from '../binder.js';
import Model from '../model.js';

export default function (binder) {
	let data;

	return {
		write () {
			data = Methods.get(binder.keys);

			if (typeof data !== 'function') {
				console.warn(`Oxe - attribute o-on="${binder.keys.join('.')}" invalid type function required`);
				return false;
			}

			if (!binder.cache) {
				binder.cache = function (e) {
					const parameters = [e];

					for (let i = 0, l = binder.pipes.length; i < l; i++) {
						const keys = binder.pipes[i].split('.');
						keys.unshift(binder.scope);
						const parameter = Model.get(keys);
						parameters.push(parameter);
					}

					Promise.resolve()
					.then(data.bind(binder.container).apply(null, parameters))
					.catch(console.error);
				};
			}

			binder.element.removeEventListener(binder.names[1], binder.cache);
			binder.element.addEventListener(binder.names[1], binder.cache);
		}
	};
};