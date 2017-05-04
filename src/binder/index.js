var Model = require('./model');
var View = require('./view');

function Binder () {}

Binder.prototype.create = function (options, callback) {
	var self = this;

	Object.defineProperties(self, {
		name: {
			value: options.name
		},
		modifiers: {
			value: options.modifiers || {}
		},
		collection: {
			value: options.model || {}
		},
		_view: {
			value: View()
		},
		_model: {
			value: Model()
		},
		view: {
			enumerable: true,
			get: function () {
				return self._view.data;
			}
		},
		model: {
			enumerable: true,
			get: function () {
				return self._model.data;
			}
		},
		elements: {
			get: function () {
				return (options.view.shadowRoot || options.view).querySelectorAll('*');
			}
		}
	});

	self._model.setup(self.collection, function (path, value) {
		console.log('\n');
		console.log(path);
		console.log(value);
		console.log('\n');

		self._view.eachPath('^' + path + '', function (units) {
			units.forEach(function (unit, index) {
				if (value === undefined) {
					self._view.remove(path, index);
				} else {
					// unit.data = value;
					unit.render();
				}
			});
		});
	});

	self._view.setup(self.elements, function (unit) {
		unit.binder = self;
		unit.data = self._model.get(unit.attribute.path);
		unit.render();
		return unit;
	});

	if (callback) callback.call(self);

	return self;
};

module.exports = function (options, callback) {
	return new Binder().create(options, callback);
};
