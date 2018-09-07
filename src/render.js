import Utility from './utility.js';
import Batcher from './batcher.js';
import Methods from './methods.js';
import Binder from './binder.js';
import Wraper from './wraper.js';
import Model from './model.js';

// TODO dynamic for list dont handle selected

export default {

	required (opt) {
		Batcher.read(function () {
			var data = Model.get(opt.keys);

			if (opt.element.required === data) {
				return;
			}

			data = Utility.binderModifyData(opt, data);

			Batcher.write(function () {
				opt.element.required = data;
			});
		});
	},

	disable (opt) {
		Batcher.read(function () {
			var data = Model.get(opt.keys);

			if (opt.element.disabled === data) {
				return;
			}

			data = Binder.modifyData(opt, data);

			Batcher.write(function () {
				opt.element.disabled = data;
			});
		});
	},

	enable (opt) {
		Batcher.read(function () {
			var data = Model.get(opt.keys);

			if (opt.element.disabled === !data) {
				return;
			}

			data = Binder.modifyData(opt, data);

			Batcher.write(function () {
				opt.element.disabled = !data;
			});
		});
	},

	hide (opt) {
		Batcher.read(function () {
			var data = Model.get(opt.keys);

			if (opt.element.hidden === data) {
				return;
			}

			data = Binder.modifyData(opt, data);

			Batcher.write(function () {
				opt.element.hidden = data;
			});
		});
	},

	show (opt) {
		Batcher.read(function () {
			var data = Model.get(opt.keys);

			if (opt.element.hidden === !data) {
				return;
			}

			data = Binder.modifyData(opt, data);

			Batcher.write(function () {
				opt.element.hidden = !data;
			});
		});
	},

	read (opt) {
		Batcher.read(function () {
			var data = Model.get(opt.keys);

			if (opt.element.readOnly === data) {
				return;
			}

			data = Binder.modifyData(opt, data);

			Batcher.write(function () {
				opt.element.readOnly = data;
			});
		});
	},

	write (opt) {
		Batcher.read(function () {
			var data = Model.get(opt.keys);

			if (opt.element.readOnly === !data) {
				return;
			}

			data = Binder.modifyData(opt, data);

			Batcher.write(function () {
				opt.element.readOnly = !data;
			});
		});
	},

	html (opt) {
		Batcher.read(function () {
			var data = Model.get(opt.keys);

			if (opt.element.innerHTML === data) {
				return;
			}

			data = Binder.modifyData(opt, data);

			Batcher.write(function () {
				opt.element.innerHTML = data;
			});
		});
	},

	class (opt) {
		Batcher.write(function () {
			var data = Model.get(opt.keys);
			var name = opt.names.slice(1).join('-');
			data = Binder.modifyData(opt, data);
			opt.element.classList.toggle(name, data);
		});
	},

	on (opt) {
		Batcher.write(function () {
			var data = Utility.getByPath(Methods.data, opt.scope + '.' + opt.path);

			if (!data || typeof data !== 'function') {
				return;
			}

			if (opt.cache) {
				opt.element.removeEventListener(opt.names[1], function (e) {
					Wraper(opt.cache.bind(null, e));
				});
			} else {
				opt.cache = data.bind(opt.container);
			}

			opt.element.addEventListener(opt.names[1], function (e) {
				Wraper(opt.cache.bind(null, e));
			});

		});
	},

	css (opt) {
		Batcher.read(function () {
			var data = Model.get(opt.keys);

			if (opt.element.style.cssText === data) {
				return;
			}

			if (opt.names.length > 1) {
				data = opt.names.slice(1).join('-') + ': ' +  data + ';';
			}

			data = Binder.modifyData(opt, data);

			Batcher.write(function () {
				opt.element.style.cssText = data;
			});
		});
	},

	text (opt) {
		Batcher.read(function () {
			var data = Model.get(opt.keys);

			data = data === undefined || data === null ? '' : data;

			if (data && typeof data === 'object') {
				data = JSON.stringify(data);
			} else if (data && typeof data !== 'string') {
				data = String(data);
			}

			data = Binder.modifyData(opt, data);

			Batcher.write(function () {
				opt.element.innerText = data;
			});
		});
	},

	each (opt) {
		Batcher.read(function () {
			var data = Model.get(opt.keys);
			var isArray = data ? data.constructor === Array : false;
			var isObject = data ? data.constructor === Object: false;

			if (!data || typeof data !== 'object') {
				return;
			} else if (isArray && opt.element.children.length === data.length) {
				return;
			} else if (isObject && opt.element.children.length === Object.keys(data).length) {
				return;
			}

			data = Binder.modifyData(opt, data);

			Batcher.write(function () {

				if (isObject) {
					data = Object.keys(data);
				}

				while (opt.element.children.length !== data.length) {

					if (opt.element.children.length > data.length) {
						opt.element.removeChild(opt.element.children[opt.element.children.length-1]);
					} else if (opt.element.children.length < data.length) {
						var key;
						var clone = opt.cache.cloneNode(true);

						if (isArray) {
							key = opt.element.children.length;
						} else if (isObject) {
							key = data[opt.element.children.length];
						}

						Utility.replaceEachVariable(clone, opt.names[1], opt.path, key);
						Binder.bind(clone, opt.container);

						opt.element.appendChild(clone);
					}
				}

			});
		});
	},

	value (opt) {
		Batcher.read(function () {

			var type = opt.element.type;
			var name = opt.element.nodeName;
			var attribute, query, multiple;
			var i, l, data, element, elements;

			if (opt.setup) {
				opt.setup = false;

				data = Model.get(opt.keys);

				if (name === 'SELECT') {
					elements = opt.element.options;
					multiple = opt.element.multiple;
					data = data === undefined ? (multiple ? [] : '') : data;
					for (i = 0, l = elements.length; i < l; i++) {
						if (!elements[i].disabled) {
							if (elements[i].selected) {
								if (multiple) {
									data.push(elements[i].value || elements[i].innerText || '');
								} else {
									data = elements[i].value || elements[i].innerText || '';
									break;
								}
							} else if (i === l-1 && !multiple) {
								data = elements[0].value || elements[0].innerText || '';
							}
						}
					}
				} else if (type === 'radio') {
					data = data === undefined ? 0 : data;
					query = 'input[type="radio"][o-value="' + opt.value + '"]';
					elements = opt.container.querySelectorAll(query);
					for (i = 0, l = elements.length; i < l; i++) {
						element = elements[i];
						if (i === data) {
							element.checked = true;
						} else {
							element.checked = false;
						}
					}
				} else if (type === 'file') {
					data = data === undefined ? [] : data;
					for (i = 0, l = data.length; i < l; i++) {
						opt.element.files[i] = data[i];
					}
				} else if (type === 'checkbox') {
					attribute = 'checked';
					data = data === undefined ? false : data;
				} else {
					attribute = 'value';
					data = data === undefined ? '' : data;
				}

				if (attribute) {
					opt.element[attribute] = Binder.modifyData(opt, data);
				}

			} else {

				if (name === 'SELECT') {
					multiple = opt.element.multiple;
					elements = opt.element.options;
					data = multiple ? [] : '';
					for (i = 0, l = elements.length; i < l; i++) {
						element = elements[i];
						if (element.selected) {
							if (multiple) {
								data.push(element.value || element.innerText);
							} else {
								data = element.value || element.innerText;
								break;
							}
						}
					}
				} else if (type === 'radio') {
					query = 'input[type="radio"][o-value="' + opt.value + '"]';
					elements = opt.container.querySelectorAll(query);
					for (i = 0, l = elements.length; i < l; i++) {
						element = elements[i];
						if (opt.element === element) {
							data = i;
							element.checked = true;
						} else {
							element.checked = false;
						}
					}
				} else if (type === 'file') {
					data = data || [];
					for (i = 0, l = opt.element.files.length; i < l; i++) {
						data[i] = opt.element.files[i];
					}
				} else if (type === 'checkbox') {
					data = opt.element.checked;
				} else {
					data = opt.element.value;
				}

			}

			if (data !== undefined) {
				Model.set(opt.keys, data);
			}

		});
	},

	default (opt) {
		Batcher.read(function () {
			var data = Model.get(opt.keys);

			if (opt.element[opt.type] === data) {
				return;
			}

			data = Binder.modifyData(opt, data);

			Batcher.write(function () {
				opt.element[opt.type] = data;
			});
		});
	}

};
