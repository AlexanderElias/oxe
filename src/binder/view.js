var Global = require('../global');
var Unit = require('./unit');

var PATH = Global.rPath;
var PREFIX = Global.rPrefix;
var MODIFIERS = Global.rModifier;
var ATTRIBUTE_ACCEPTS = Global.rAttributeAccepts;
var ELEMENT_ACCEPTS = Global.rElementAccepts;
var ELEMENT_REJECTS = Global.rElementRejects;
var ELEMENT_REJECTS_CHILDREN = Global.rElementRejectsChildren;

function View () {}

View.prototype.glance = function (element) {
	return element.outerHTML
	.replace(/\/?>([\s\S])*/, '')
	.replace(/^</, '');
};

View.prototype.eachElement = function (elements, callback) { //skip,
	var element, glance, i;

	for (i = 0; i < elements.length; i++) {
		element = elements[i];
		glance = this.glance(element);

		if (ELEMENT_REJECTS.test(glance)) {
			i += element.querySelectorAll('*').length;
		} else if (ELEMENT_REJECTS_CHILDREN.test(glance)) {
			i += element.querySelectorAll('*').length;
			callback(element);
		// } else if (skip && skip.test(glance)) {
		// 	continue;
		} else if (ELEMENT_ACCEPTS.test(glance)) {
			callback(element);
		}
	}
};

View.prototype.eachAttribute = function (element, callback) {
	var attributes = element.attributes, attribute, i;

	for (i = 0; i < attributes.length; i++) {
		attribute = {};
		attribute.name = attributes[i].name;
		attribute.value = attributes[i].value;

		if (ATTRIBUTE_ACCEPTS.test(attribute.name)) {
			attribute.path = attribute.value.replace(PATH, '');
			attribute.opts = attribute.path.split('.');
			attribute.command = attribute.name.replace(PREFIX, '');
			attribute.cmds = attribute.command.split('-');

			if (attribute.value.indexOf('|') === -1) {
				attribute.modifiers = [];
			} else {
				attribute.modifiers = attribute.value.replace(MODIFIERS, '').split(' ');
			}

			callback(attribute);
		}

	}
};

View.prototype.eachPath = function (path, callback) {
	var self = this, key;

	path = typeof path === 'string' ? new RegExp(path) : path;

	for (key in self.data) {
		if (path.test(key)) {
			callback(self.data[key], key);
		}
	}
};

View.prototype.units = function (path) {
	return this.data[path] || [];
};

View.prototype.paths = function () {
	return Object.keys(this.data);
};

View.prototype.set = function (elements, callback) {
	var self = this;

	self.eachElement(elements, function (element) {
		self.eachAttribute(element, function (attribute) {
			if (!(attribute.path in self.data)) self.data[attribute.path] = [];
			self.data[attribute.path].push(
				callback(
					Unit({ element: element, attribute: attribute }),
					attribute.path, self.data[attribute.path].length-1
				)
			);

		});
	});

	return self;
};

View.prototype.removeAll = function (pattern) {
	var self = this, path, index, length;

	pattern = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

	for (path in self.data) {
		index = 0, length = self.data[path].length;
		for (index; index < length; index++) {
			if (pattern.test(path + '.' + index.toString())) {
				self.data[path].splice(index, 1);
			}
		}
	}
};

View.prototype.removeOne = function (pattern) {
	var self = this, path, index, length;

	pattern = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

	for (path in self.data) {
		index = 0, length = self.data[path].length;
		for (index; index < length; index++) {
			if (pattern.test(path + '.' + index.toString())) {
				self.data[path].slice(index, 1);
				break;
			}
		}
	}
};

View.prototype.setup = function (elements, callback) {
	var self = this;

	self.eachElement(elements, function (element) {
		self.eachAttribute(element, function (attribute) {
			if (!(attribute.path in self.data)) self.data[attribute.path] = [];
			self.data[attribute.path].push(callback(Unit({ element: element, attribute: attribute })));

		});
	});

	return self;
};

View.prototype.create = function (options) {
	var self = this;
	options = options || {};
	self.data = options.data || {};
	return self;
};

module.exports = function (options) {
	return new View().create(options);
};
