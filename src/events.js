
export default class Events {

	constructor () {
		this.events = {};
	}

	on (name, method) {

		if (!(name in this.events)) {
			this.events[name] = [];
		}

		this.events[name].push(method);
	}

	off (name, method) {

		if (name in this.events) {

			var index = this.events[name].indexOf(method);

			if (index !== -1) {
				this.events[name].splice(index, 1);
			}

		}

	}

	emit (name) {

		if (name in this.events) {

			var methods = this.events[name];
			var args = Array.prototype.slice.call(arguments, 1);

			for (var i = 0, l = methods.length; i < l; i++) {
				methods[i].apply(this, args);
			}

		}

	}

}
