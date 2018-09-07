import Observer from './observer.js';
import Events from './events.js';
import Binder from './binder.js';

class Model extends Events {

	constructor () {
		super();

		this.GET = 2;
		this.SET = 3;
		this.REMOVE = 4;
		this.ran = false;

		this.data = Observer.create({}, this.listener);
	}

	traverse (type, keys, value) {

		if (typeof keys === 'string') {
			keys = [keys];
		}

		var data = this.data;
		var v, p, path, result;
		var key = keys[keys.length-1];

		for (var i = 0, l = keys.length-1; i < l; i++) {

			if (!(keys[i] in data)) {

				if (type === this.GET || type === this.REMOVE) {
					return undefined;
				} else if (type === this.SET) {
					data.$set(keys[i], isNaN(keys[i+1]) ? {} : []);
				}

			}

			data = data[keys[i]];
		}

		if (type === this.SET) {
			result = data.$set(key, value);
		} else if (type === this.GET) {
			result = data[key];
		} else if (type === this.REMOVE) {
			result = data[key];
			data.$remove(key);
		}

		return result;
	}

	get (keys) {
		return this.traverse(this.GET, keys);
	}

	remove (keys) {
		return this.traverse(this.REMOVE, keys);
	}

	set (keys, value) {
		return this.traverse(this.SET, keys, value);
	}

	listener (data, path) {
		var type = data === undefined ? 'unrender' : 'render';
		Binder.each(path, function (binder) {
			Binder[type](binder);
		});
	}

}

export default new Model();
