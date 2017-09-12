function o1() {
	function o() {
		this._a = null;
		this._b = null;
		this._c = null;
	}

	Object.defineProperty(o, 'a', {
		get: function get() {
			return this._a;
		},
		set: function set(newValue) {
			this._a = newValue;
		},
		enumerable: true,
		configurable: true
	});

	Object.defineProperty(o, 'b', {
		get: function get() {
			return this._b;
		},
		set: function set(newValue) {
			this._b = newValue;
		},
		enumerable: true,
		configurable: true
	});

	Object.defineProperty(o, 'c', {
		get: function get() {
			return this._c;
		},
		set: function set(newValue) {
			this._c = newValue;
		},
		enumerable: true,
		configurable: true
	});
}

function o2() {
	this._a = null;
	this._b = null;
	this._c = null;

	Object.defineProperty(this, 'a', {
		get: function get() {
			return this._a;
		},
		set: function set(newValue) {
			this._a = newValue;
		},
		enumerable: true,
		configurable: true
	});

	Object.defineProperty(this, 'b', {
		get: function get() {
			return this._b;
		},
		set: function set(newValue) {
			this._b = newValue;
		},
		enumerable: true,
		configurable: true
	});

	Object.defineProperty(this, 'c', {
		get: function get() {
			return this._c;
		},
		set: function set(newValue) {
			this._c = newValue;
		},
		enumerable: true,
		configurable: true
	});
}

function o3() {
	function o() {
		this._a = null;
		this._b = null;
		this._c = null;
	}

	Object.defineProperties(o, {
		'a': {
			get: function get() {
				return this._a;
			},
			set: function set(newValue) {
				this._a = newValue;
			},
			enumerable: true,
			configurable: true
		},
		'b': {
			get: function get() {
				return this._b;
			},
			set: function set(newValue) {
				this._b = newValue;
			},
			enumerable: true,
			configurable: true
		},
		'c': {
			get: function get() {
				return this._c;
			},
			set: function set(newValue) {
				this._c = newValue;
			},
			enumerable: true,
			configurable: true
		}

	});
}

function o4() {
	this._a = null;
	this._b = null;
	this._c = null;

	Object.defineProperties(this, {
		'a': {
			get: function get() {
				return this._a;
			},
			set: function set(newValue) {
				this._a = newValue;
			},
			enumerable: true,
			configurable: true
		},
		'b': {
			get: function get() {
				return this._b;
			},
			set: function set(newValue) {
				this._b = newValue;
			},
			enumerable: true,
			configurable: true
		},
		'c': {
			get: function get() {
				return this._c;
			},
			set: function set(newValue) {
				this._c = newValue;
			},
			enumerable: true,
			configurable: true
		}
	});
}