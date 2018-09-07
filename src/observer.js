
/*
	TODO:
		sort reverse
		test array methods
		figure out a way to not update removed items
*/

let Observer = {

	splice () {
		let startIndex = arguments[0];
		let deleteCount = arguments[1];
		let addCount = arguments.length > 2 ? arguments.length - 2 : 0;

		if (typeof startIndex !== 'number' || typeof deleteCount !== 'number') {
			return [];
		}

		// handle negative startIndex
		if (startIndex < 0) {
			startIndex = this.length + startIndex;
			startIndex = startIndex > 0 ? startIndex : 0;
		} else {
			startIndex = startIndex < this.length ? startIndex : this.length;
		}

		// handle negative deleteCount
		if (deleteCount < 0) {
			deleteCount = 0;
		} else if (deleteCount > (this.length - startIndex)) {
			deleteCount = this.length - startIndex;
		}

		let totalCount = this.$meta.length;
		let key, index, value, updateCount;
		let argumentIndex = 2;
		let argumentsCount = arguments.length - argumentIndex;
		let result = this.slice(startIndex, deleteCount);

		updateCount = (totalCount - 1) - startIndex;

		if (updateCount > 0) {
			index = startIndex;
			while (updateCount--) {
				key = index++;

				if (argumentsCount && argumentIndex < argumentsCount) {
					value = arguments[argumentIndex++];
				} else {
					value = this.$meta[index];
				}

				this.$meta[key] = Observer.create(value, this.$meta.listener, this.$meta.path + key);
				this.$meta.listener(this.$meta[key], this.$meta.path + key, key);
			}
		}

		if (addCount > 0) {
			while (addCount--) {
				key = this.length;
				this.$meta[key] = Observer.create(arguments[argumentIndex++], this.$meta.listener, this.$meta.path + key);
				Observer.defineProperty(this, key);
				this.$meta.listener(this.length, this.$meta.path.slice(0, -1), 'length');
				this.$meta.listener(this.$meta[key], this.$meta.path + key, key);
			}
		}

		if (deleteCount > 0) {
			while (deleteCount--) {
				this.$meta.length--;
				this.length--;
				key = this.length;
				this.$meta.listener(key, this.$meta.path.slice(0, -1), 'length');
				this.$meta.listener(undefined, this.$meta.path + key, key);
			}
		}

		return result;
	},

	arrayProperties () {
		let self = this;

		return {
			push: {
				value: function () {
					if (!arguments.length) return this.length;

					for (let i = 0, l = arguments.length; i < l; i++) {
						self.splice.call(this, this.length, 0, arguments[i]);
					}

					return this.length;
				}
			},
			unshift: {
				value: function () {
					if (!arguments.length) return this.length;

					for (let i = 0, l = arguments.length; i < l; i++) {
						self.splice.call(this, 0, 0, arguments[i]);
					}

					return this.length;
				}
			},
			pop: {
				value: function () {
					if (!this.length) return;
					return self.splice.call(this, this.length-1, 1);
				}
			},
			shift: {
				value: function () {
					if (!this.length) return;
					return self.splice.call(this, 0, 1);
				}
			},
			splice: {
				value: self.splice
			}
		};
	},

	objectProperties () {
		let self = this;

		return {
			$get: {
				value: function (key) {
					return this[key];
				}
			},
			$set: {
				value: function (key, value) {
					// if (key !== undefined && value !== undefined) {
						if (value !== this[key]) {
							let result = self.create(value, this.$meta.listener, this.$meta.path + key);

							this.$meta[key] = result;
							self.defineProperty(this, key);

							this.$meta.listener(result, this.$meta.path + key, key);

							return result;
						}
					// } else {

						// if (!key || key.constructor !== this.constructor) {
						// 	return this;
						// } else if (key.constructor === Array) {
						// 	for (let value of key) {
						// 		this.$set(name, value);
						// 	}
						// } else if (key.constructor === Object) {
						// 	for (let name in key) {
						// 		this.$set(name, key[name]);
						// 	}
						// }
						//
						// return this;
					// }
				}
			},
			$remove: {
				value: function (key) {
					if (key in this) {
						if (this.constructor === Array) {
							return self.splice.call(this, key, 1);
						} else {
							let result = this[key];
							delete this.$meta[key];
							delete this[key];
							this.$meta.listener(undefined, this.$meta.path + key, key);
							return result;
						}
					}
				}
			}
		};
	},

	property (key) {
		let self = this;

		return {
			enumerable: true,
			configurable: true,
			get: function () {
				return this.$meta[key];
			},
			set: function (value) {
				if (value !== this.$meta[key]) {

					this.$meta[key] = self.create(value, this.$meta.listener, this.$meta.path + key);

					this.$meta.listener(this[key], this.$meta.path + key, key, this);
				}
			}
		};
	},

	defineProperty (data, key) {
		return Object.defineProperty(data, key, this.property(key));
	},

	create (source, listener, path) {
		let self = this;

		if (!source || source.constructor !== Object && source.constructor !== Array) {
			return source;
		}

		path = path ? path + '.' : '';

		let key, length;
		let type = source.constructor;
		let target = source.constructor();
		let properties = source.constructor();

		properties.$meta = {
			value: source.constructor()
		};

		properties.$meta.value.path = path;
		properties.$meta.value.listener = listener;

		if (type === Array) {

			for (key = 0, length = source.length; key < length; key++) {
				properties.$meta.value[key] = self.create(source[key], listener, path + key);
				properties[key] = self.property(key);
			}

			let arrayProperties = self.arrayProperties();

			for (key in arrayProperties) {
				properties[key] = arrayProperties[key];
			}

		}

		if (type === Object) {

			for (key in source) {
				properties.$meta.value[key] = self.create(source[key], listener, path + key);
				properties[key] = self.property(key);
			}

		}

		let objectProperties = self.objectProperties();

		for (key in objectProperties) {
			properties[key] = objectProperties[key];
		}

		return Object.defineProperties(target, properties);
	}

};

export default Observer;
