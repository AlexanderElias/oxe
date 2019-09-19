function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = global || self, global.Oxe = factory());
})(this, function () {
  'use strict';

  var Utility = {
    PIPE: /\s?\|\s?/,
    PIPES: /\s?,\s?|\s+/,
    value: function value(element, model) {
      if (!model) throw new Error('Utility.value - requires model argument');
      if (!element) throw new Error('Utility.value - requires element argument');
      var type = this.type(element);

      if (type === 'radio' || type === 'checkbox') {
        var name = this.name(element);
        var query = 'input[type="' + type + '"][name="' + name + '"]';
        var form = this.form(element);
        var elements = form ? this.form(element).querySelectorAll(query) : [element];
        var multiple = elements.length > 1;
        var result = multiple ? [] : undefined;

        for (var i = 0, l = elements.length; i < l; i++) {
          var child = elements[i];
          var checked = this.checked(child);
          if (!checked) continue;
          var value = this.value(child, model);

          if (multiple) {
            result.push(value);
          } else {
            result = value;
            break;
          }
        }

        return result;
      } else if (type === 'select-one' || type === 'select-multiple') {
        var _multiple = this.multiple(element);

        var options = element.options;

        var _result = _multiple ? [] : undefined;

        for (var _i = 0, _l = options.length; _i < _l; _i++) {
          var option = options[_i];
          var selected = option.selected;

          var _value = this.value(option, model);

          var match = this[_multiple ? 'includes' : 'compare'](this.data, _value);

          if (selected && !match) {
            if (this.multiple) {
              _result.push(_value);
            } else {
              _result = _value;
            }
          } else if (!selected && match) {
            option.selected = true;
          }
        }

        return _result;
      } else {
        var attribute = element.attributes['o-value'];

        if (attribute) {
          var values = this.binderValues(attribute.value);

          var _value2 = this.getByPath(model, values);

          return _value2 || element.value;
        } else {
          return element.value;
        }
      }
    },
    form: function form(element) {
      if (element.form) {
        return element.form;
      } else {
        while (element = element.parentElement) {
          if (element.nodeName === 'FORM' || element.nodeName.indexOf('-FORM') !== -1) {
            return element;
          }
        }
      }
    },
    type: function type(element) {
      if (typeof element.type === 'string') {
        return element.type;
      } else {
        return element.getAttribute('type');
      }
    },
    name: function name(element) {
      if (typeof element.name === 'string') {
        return element.name;
      } else {
        return element.getAttribute('name');
      }
    },
    checked: function checked(element) {
      if (typeof element.checked === 'boolean') {
        return element.checked;
      } else {
        switch (element.getAttribute('checked')) {
          case undefined:
            return false;

          case 'true':
            return true;

          case null:
            return false;

          case '':
            return true;

          default:
            return false;
        }
      }
    },
    multiple: function multiple(element) {
      if (typeof element.multiple === 'boolean') {
        return element.multiple;
      } else {
        switch (element.getAttribute('multiple')) {
          case undefined:
            return false;

          case 'true':
            return true;

          case null:
            return false;

          case '':
            return true;

          default:
            return false;
        }
      }
    },
    disabled: function disabled(element) {
      if (typeof element.disabled === 'boolean') {
        return element.disabled;
      } else {
        switch (element.getAttribute('disabled')) {
          case undefined:
            return false;

          case 'true':
            return true;

          case null:
            return false;

          case '':
            return true;

          default:
            return false;
        }
      }
    },
    index: function index(items, item) {
      for (var i = 0, l = items.length; i < l; i++) {
        if (this.match(items[i], item)) {
          return i;
        }
      }

      return -1;
    },
    includes: function includes(items, item) {
      for (var i = 0, l = items.length; i < l; i++) {
        if (this.match(items[i], item)) {
          return true;
        }
      }

      return false;
    },
    match: function match(source, target) {
      if (source === target) {
        return true;
      }

      if (source === null || source === undefined) {
        return false;
      }

      if (target === null || target === undefined) {
        return false;
      }

      if (_typeof(source) !== _typeof(target)) {
        return false;
      }

      if (source.constructor !== target.constructor) {
        return false;
      }

      if (_typeof(source) !== 'object' || _typeof(target) !== 'object') {
        return source === target;
      }

      var sourceKeys = Object.keys(source);
      var targetKeys = Object.keys(target);

      if (sourceKeys.length !== targetKeys.length) {
        return false;
      }

      for (var i = 0, l = sourceKeys.length; i < l; i++) {
        var name = sourceKeys[i];

        if (!this.match(source[name], target[name])) {
          return false;
        }
      }

      return true;
    },
    binderNames: function binderNames(data) {
      data = data.split('o-')[1];
      return data ? data.split('-') : [];
    },
    binderValues: function binderValues(data) {
      data = data.split(this.PIPE)[0];
      return data ? data.split('.') : [];
    },
    binderPipes: function binderPipes(data) {
      data = data.split(this.PIPE)[1];
      return data ? data.split(this.PIPES) : [];
    },
    ensureElement: function ensureElement(data) {
      data.query = data.query || '';
      data.scope = data.scope || document.body;
      data.position = data.position || 'beforeend';
      var element = data.scope.querySelector("".concat(data.name).concat(data.query));

      if (!element) {
        element = document.createElement(data.name);
        data.scope.insertAdjacentElement(data.position, element);
      }

      for (var i = 0, l = data.attributes.length; i < l; i++) {
        var _data$attributes$i = data.attributes[i],
            name = _data$attributes$i.name,
            value = _data$attributes$i.value;
        element.setAttribute(name, value);
      }

      return element;
    },
    setByPath: function setByPath(data, path, value) {
      var keys = typeof path === 'string' ? path.split('.') : path;
      var last = keys.length - 1;

      for (var i = 0; i < last; i++) {
        var key = keys[i];

        if (!(key in data)) {
          if (isNaN(keys[i + 1])) {
            data[key] = {};
          } else {
            data[key] = [];
          }
        }

        data = data[key];
      }

      return data[keys[last]] = value;
    },
    getByPath: function getByPath(data, path) {
      var keys = typeof path === 'string' ? path.split('.') : path;
      var last = keys.length - 1;

      if (keys[last] === '$key' || keys[last] === '$index') {
        return keys[last - 1];
      }

      for (var i = 0; i < last; i++) {
        var key = keys[i];

        if (key in data === false) {
          return undefined;
        } else {
          data = data[key];
        }
      }

      return data[keys[last]];
    },
    clone: function clone(source) {
      if (source === null || source === undefined || source.constructor !== Array && source.constructor !== Object) {
        return source;
      }

      var target = source.constructor();

      for (var name in source) {
        var descriptor = Object.getOwnPropertyDescriptor(source, name);

        if (descriptor) {
          if ('value' in descriptor) {
            descriptor.value = this.clone(descriptor.value);
          }

          Object.defineProperty(target, name, descriptor);
        }
      }

      return target;
    }
  };
  var Batcher = {
    reads: [],
    writes: [],
    time: 1000 / 30,
    pending: false,
    setup: function setup(options) {
      options = options || {};
      this.time = options.time || this.time;
    },
    tick: function tick(callback) {
      window.requestAnimationFrame(callback.bind(this, null));
    },
    schedule: function schedule() {
      if (this.pending) return;
      this.pending = true;
      this.tick(this.flush);
    },
    flush: function flush(time) {
      time = time || performance.now();
      var task;

      if (this.writes.length === 0) {
        while (task = this.reads.shift()) {
          if (task) {
            task();
          }

          if (performance.now() - time > this.time) {
            return this.tick(this.flush);
          }
        }
      }

      while (task = this.writes.shift()) {
        if (task) {
          task();
        }

        if (performance.now() - time > this.time) {
          return this.tick(this.flush);
        }
      }

      if (this.reads.length === 0 && this.writes.length === 0) {
        this.pending = false;
      } else if (performance.now() - time > this.time) {
        this.tick(this.flush);
      } else {
        this.flush(time);
      }
    },
    remove: function remove(tasks, task) {
      var index = tasks.indexOf(task);
      return !!~index && !!tasks.splice(index, 1);
    },
    clear: function clear(task) {
      return this.remove(this.reads, task) || this.remove(this.writes, task);
    },
    batch: function batch(data) {
      var self = this;
      if (!data) return;
      if (!data.read && !data.write) return;
      data.context = data.context || {};

      var read = function read() {
        var result;

        if (data.read) {
          result = data.read.call(data.context, data.context);
        }

        if (data.write && result !== false) {
          var write = data.write.bind(data.context, data.context);
          self.writes.push(write);
        }
      };

      self.reads.push(read);
      self.schedule();
    }
  };

  function Piper(binder, data) {
    if (binder.type === 'on') {
      return data;
    }

    if (!binder.pipes.length) {
      return data;
    }

    var methods = binder.container.methods;

    if (!methods) {
      return data;
    }

    for (var i = 0, l = binder.pipes.length; i < l; i++) {
      var name = binder.pipes[i];

      if (name in methods) {
        var method = methods[name];

        if (method && method.constructor === Function) {
          data = methods[name].call(binder.container, data);
        } else {
          console.warn("Oxe.piper - pipe ".concat(name, " invalid type"));
        }
      } else {
        console.warn("Oxe.piper - pipe ".concat(name, " not found"));
      }
    }

    return data;
  }

  function Class(binder) {
    return {
      read: function read() {
        this.data = binder.data;

        if (binder.names.length > 1) {
          this.name = binder.names.slice(1).join('-');
        }
      },
      write: function write() {
        if (this.name) {
          if (this.data === undefined || this.data === null) {
            binder.target.classList.remove(this.name);
          } else {
            binder.target.classList.toggle(this.name, this.data);
          }
        } else {
          if (this.data === undefined || this.data === null) {
            binder.target.setAttribute('class', '');
          } else {
            binder.target.setAttribute('class', this.data);
          }
        }
      }
    };
  }

  function Default(binder) {
    return {
      read: function read() {
        this.data = binder.data;

        if (this.data === undefined || this.data === null) {
          this.data = '';
        } else if (_typeof(this.data) === 'object') {
          this.data = JSON.stringify(this.data);
        } else if (typeof this.data !== 'string') {
          this.data = this.data.toString();
        }

        if (this.data === binder.target[binder.type]) {
          return false;
        }
      },
      write: function write() {
        binder.target[binder.type] = this.data;
      }
    };
  }

  function Disable(binder) {
    return {
      read: function read() {
        this.data = binder.data;

        if (this.data === binder.target.disabled) {
          return false;
        }
      },
      write: function write() {
        binder.target.disabled = this.data;
      }
    };
  }

  function Each(binder) {
    var self = this;
    var render = {
      read: function read() {
        this.data = binder.data || [];

        if (binder.meta.keys === undefined) {
          binder.meta.keys = [];
          binder.meta.pending = false;
          binder.meta.targetLength = 0;
          binder.meta.currentLength = 0;

          if (binder.target.firstElementChild) {
            binder.meta.template = binder.target.removeChild(binder.target.firstElementChild);
          } else {
            var element = document.createElement('div');
            var text = document.createTextNode("{{$".concat(binder.names[1], "}}"));
            element.appendChild(text);
            binder.meta.template = element;
          }
        }

        binder.meta.keys = Object.keys(this.data);
        binder.meta.targetLength = binder.meta.keys.length;

        if (binder.meta.currentLength === binder.meta.targetLength) {
          return false;
        }
      },
      write: function write() {
        if (binder.meta.currentLength === binder.meta.targetLength) {
          binder.meta.pending = false;
          return;
        }

        if (binder.meta.currentLength > binder.meta.targetLength) {
          var element = binder.target.lastElementChild;
          binder.target.removeChild(element);
          self.remove(element);
          binder.meta.currentLength--;
        } else if (binder.meta.currentLength < binder.meta.targetLength) {
          var _element = binder.meta.template.cloneNode(true);

          var _index = binder.meta.currentLength++;

          self.add(_element, {
            index: _index,
            path: binder.path,
            variable: binder.names[1],
            container: binder.container,
            scope: binder.container.scope,
            key: binder.meta.keys[_index]
          });
          binder.target.appendChild(_element);
        }

        if (binder.meta.pending && render.read) {
          return;
        } else {
          binder.meta.pending = true;
        }

        delete render.read;
        Batcher.batch(render);
      }
    };
    return render;
  }

  function Enable(binder) {
    return {
      read: function read() {
        this.data = !binder.data;

        if (this.data === binder.target.disabled) {
          return false;
        }
      },
      write: function write() {
        binder.target.disabled = this.data;
      }
    };
  }

  function Hide(binder) {
    return {
      read: function read() {
        this.data = binder.data;

        if (this.data === binder.target.hidden) {
          return false;
        }
      },
      write: function write() {
        binder.target.hidden = this.data;
      }
    };
  }

  function Href(binder) {
    return {
      read: function read() {
        this.data = binder.data || '';

        if (this.data === binder.target.href) {
          return false;
        }
      },
      write: function write() {
        binder.target.href = this.data;
      }
    };
  }

  function Html(binder) {
    var self = this;
    return {
      read: function read() {
        this.data = binder.data;

        if (this.data === undefined || this.data === null) {
          this.data = '';
        } else if (_typeof(this.data) === 'object') {
          this.data = JSON.stringify(this.data);
        } else if (typeof this.data !== 'string') {
          this.data = String(this.data);
        }
      },
      write: function write() {
        while (binder.target.firstChild) {
          var node = binder.target.removeChild(binder.target.firstChild);
          self.remove(node);
        }

        var fragment = document.createDocumentFragment();
        var parser = document.createElement('div');
        parser.innerHTML = this.data;

        while (parser.firstElementChild) {
          self.add(parser.firstElementChild, {
            container: binder.container,
            scope: binder.container.scope
          });
          fragment.appendChild(parser.firstElementChild);
        }

        binder.target.appendChild(fragment);
      }
    };
  }

  function Label(binder) {
    return {
      read: function read() {
        this.data = binder.data;

        if (this.data === undefined || this.data === null) {
          this.data = '';
        } else if (_typeof(this.data) === 'object') {
          this.data = JSON.stringify(this.data);
        } else if (typeof this.data !== 'string') {
          this.data = this.data.toString();
        }

        if (this.data === binder.target.getAttribute('label')) {
          return false;
        }
      },
      write: function write() {
        binder.target.setAttribute('label', this.data);
      }
    };
  }

  function On(binder) {
    return {
      read: function read(context) {
        context.data = binder.data;

        if (typeof context.data !== 'function') {
          console.warn("Oxe - binder o-on=\"".concat(binder.keys.join('.'), "\" invalid type function required"));
          return;
        }

        if (binder.meta.method) {
          binder.target.removeEventListener(binder.names[1], binder.meta.method);
        } else {
          binder.meta.method = function (events) {
            var parameters = [];

            for (var i = 0, l = binder.pipes.length; i < l; i++) {
              var keys = binder.pipes[i].split('.');
              var parameter = Utility.getByPath(binder.container.model, keys);
              parameters.push(parameter);
            }

            parameters.push(events);
            parameters.push(this);
            Promise.resolve(context.data.bind(binder.container).apply(null, parameters));
          };
        }

        binder.target.addEventListener(binder.names[1], binder.meta.method);
      }
    };
  }

  function Read(binder) {
    return {
      read: function read() {
        this.data = binder.data;

        if (this.data === binder.target.readOnly) {
          return false;
        }
      },
      write: function write() {
        binder.target.readOnly = this.data;
      }
    };
  }

  function Require(binder) {
    return {
      read: function read() {
        this.data = binder.data;

        if (this.data === binder.target.required) {
          return false;
        }
      },
      write: function write() {
        binder.target.required = this.data;
      }
    };
  }

  function Show(binder) {
    return {
      read: function read() {
        this.data = binder.data;

        if (!this.data === binder.target.hidden) {
          return false;
        }
      },
      write: function write() {
        binder.target.hidden = !this.data;
      }
    };
  }

  function Style(binder) {
    return {
      read: function read() {
        this.data = binder.data;

        if (binder.names.length > 1) {
          this.name = '';
          this.names = binder.names.slice(1);

          for (var i = 0, l = this.names.length; i < l; i++) {
            if (i === 0) {
              this.name = this.names[i].toLowerCase();
            } else {
              this.name += this.names[i].charAt(0).toUpperCase() + this.names[i].slice(1).toLowerCase();
            }
          }
        }
      },
      write: function write() {
        if (binder.names.length > 1) {
          if (this.data) {
            binder.target.style[this.name] = this.data;
          } else {
            binder.target.style[this.name] = '';
          }
        } else {
          if (this.data) {
            binder.target.style.cssText = this.data;
          } else {
            binder.target.style.cssText = '';
          }
        }
      }
    };
  }

  function Text(binder) {
    return {
      read: function read() {
        this.data = binder.data;

        if (this.data === undefined || this.data === null) {
          this.data = '';
        } else if (_typeof(this.data) === 'object') {
          this.data = JSON.stringify(this.data);
        } else if (typeof this.data !== 'string') {
          this.data = this.data.toString();
        }

        if (this.data === binder.target.textContent) {
          return false;
        }
      },
      write: function write() {
        binder.target.textContent = this.data;
      }
    };
  }

  function Value(binder, caller) {
    var self = this;
    var type = binder.target.type;
    if (binder.meta.busy) return;else binder.meta.busy = true;

    if (type === 'select-one' || type === 'select-multiple') {
      return {
        read: function read() {
          this.data = binder.data;
          this.model = binder.model;
          this.options = binder.target.options;
          this.multiple = Utility.multiple(binder.target);

          if (this.multiple && (!this.data || this.data.constructor !== Array)) {
            binder.meta.busy = false;
            throw new Error("Oxe - invalid o-value ".concat(binder.keys.join('.'), " multiple select requires array"));
          }
        },
        write: function write() {
          var fallback = false;
          var fallbackSelectedAtrribute = false;
          var fallbackValue = this.multiple ? [] : null;
          var fallbackOption = this.multiple ? [] : null;

          for (var i = 0, l = this.options.length; i < l; i++) {
            var option = this.options[i];
            var selected = option.selected;
            var optionBinder = self.get('attribute', option, 'o-value');
            var optionValue = optionBinder ? optionBinder.data : option.value;
            var selectedAtrribute = option.hasAttribute('selected');

            if (this.multiple) {
              if (selectedAtrribute) {
                fallback = true;
                fallbackOption.push(option);
                fallbackValue.push(optionValue);
              }
            } else {
              if (i === 0 || selectedAtrribute) {
                fallback = true;
                fallbackOption = option;
                fallbackValue = optionValue;
                fallbackSelectedAtrribute = selectedAtrribute;
              }
            }

            if (caller === 'view') {
              if (selected) {
                if (this.multiple) {
                  var includes = Utility.includes(this.data, optionValue);

                  if (!includes) {
                    this.selected = true;
                    binder.data.push(optionValue);
                  }
                } else if (!this.selected) {
                  this.selected = true;
                  binder.data = optionValue;
                }
              } else {
                if (this.multiple) {
                  var _index2 = Utility.index(this.data, optionValue);

                  if (_index2 !== -1) {
                    binder.data.splice(_index2, 1);
                  }
                } else if (!this.selected && i === l - 1) {
                  binder.data = null;
                }
              }
            } else {
              if (this.multiple) {
                var _includes = Utility.includes(this.data, optionValue);

                if (_includes) {
                  this.selected = true;
                  option.selected = true;
                } else {
                  option.selected = false;
                }
              } else {
                if (!this.selected) {
                  var match = Utility.match(this.data, optionValue);

                  if (match) {
                    this.selected = true;
                    option.selected = true;
                  } else {
                    option.selected = false;
                  }
                } else {
                  option.selected = false;
                }
              }
            }
          }

          if (!this.selected && fallback) {
            if (this.multiple) {
              for (var _i2 = 0, _l2 = fallbackOption.length; _i2 < _l2; _i2++) {
                fallbackOption[_i2].selected = true;
                binder.data.push(fallbackValue[_i2]);
              }
            } else if (fallbackSelectedAtrribute || this.nodeName === 'OPTION') {
              binder.data = fallbackValue;
              fallbackOption.selected = true;
            }
          }

          binder.meta.busy = false;
        }
      };
    } else if (type === 'radio') {
      return {
        read: function read() {
          this.form = binder.target.form || binder.container;
          this.query = "input[type=\"radio\"][o-value=\"".concat(binder.value, "\"]");
          this.nodes = this.form.querySelectorAll(this.query);
          this.radios = Array.prototype.slice.call(this.nodes);

          if (caller === 'view') {
            binder.data = this.radios.indexOf(binder.target);
            binder.meta.busy = false;
            return false;
          }

          this.data = binder.data;

          if (typeof this.data !== 'number') {
            binder.meta.busy = false;
            return false;
          }
        },
        write: function write() {
          for (var i = 0, l = this.radios.length; i < l; i++) {
            var radio = this.radios[i];

            if (i === this.data) {
              radio.checked = true;
            } else {
              radio.checked = false;
            }
          }

          binder.meta.busy = false;
        }
      };
    } else if (type === 'checkbox') {
      return {
        read: function read() {
          if (caller === 'view') {
            binder.data = binder.target.checked;
            binder.meta.busy = false;
            return false;
          }

          this.data = binder.data;

          if (typeof this.data !== 'boolean') {
            binder.meta.busy = false;
            return false;
          }
        },
        write: function write() {
          binder.target.checked = this.data;
          binder.meta.busy = false;
        }
      };
    } else if (type === 'file') {
      return {
        read: function read() {
          this.multiple = Utility.multiple(binder.target);
          binder.data = this.multiple ? Array.prototype.slice.call(binder.target.files) : binder.target.files[0];
          binder.meta.busy = false;
          this.data = binder.data;
        }
      };
    } else {
      return {
        read: function read() {
          if (caller === 'view') {
            binder.data = type === 'number' ? +binder.target.value : binder.target.value;
            binder.meta.busy = false;
            return false;
          }

          this.data = binder.data;

          if (this.data === binder.target.value) {
            binder.meta.busy = false;
            return false;
          }
        },
        write: function write() {
          binder.target.value = this.data === undefined || this.data === null ? '' : this.data;
          binder.meta.busy = false;
        }
      };
    }
  }

  function Write(binder) {
    return {
      read: function read() {
        this.data = binder.data;

        if (!this.data === binder.target.readOnly) {
          return false;
        }
      },
      write: function write() {
        binder.target.readOnly = !this.data;
      }
    };
  }

  var Primitives = ['true', 'false', 'undefined', 'null'];
  var Keywords = ['async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield'];
  var Quotes = ['\'', '\"', '\`'];
  var Brackets = ['(', ')', '{', '}'];
  var Spaces = [' ', '\b', '\t', '\v', '\f', '\n', '\r'];
  var Symbols = ['<', '>', ',', '|', '=', '?', ':', ';', '*', '-', '+', '/', '!', '^', '%', '&', '~'];
  var Operators = [].concat(Quotes, Brackets, Symbols);
  var Types = [Quotes, Brackets, Spaces, Symbols];
  var TypeLength = Types.length;

  var Type = function Type(data) {
    for (var i = 0; i < TypeLength; i++) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Types[i][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var char = _step.value;

          if (data === char) {
            switch (i) {
              case 0:
                return 'quote';

              case 1:
                return 'bracket';

              case 2:
                return 'space';

              case 3:
                return 'symbol';
            }
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  };

  function Parse(data, included) {
    var node = null;
    var nodes = [];

    for (var i = 0, l = data.length; i < l; i++) {
      var c = data[i];
      var previousChar = data[i - 1];
      var isLastIndex = i === l - 1;
      var type = Type(c);
      var isQuote = type === 'quote';
      var isDelimiter = type === 'quote' || type === 'bracket' || type === 'space' || type === 'symbol';

      if (node) {
        if (node.type === 'string') {
          var isSameChar = data[node.start] === c;

          if (!isSameChar || isSameChar && previousChar === '\\') {
            node.value += c;
            continue;
          } else {
            node.end = i - 1;

            if (!included || included === node.type) {
              nodes.push(included ? node.value : node);
            }

            if (isDelimiter && (!included || included === type)) {
              nodes.push(included ? c : {
                start: i,
                end: i,
                value: c,
                type: type
              });
            }

            node = null;
          }
        } else if (node.type === 'unknown') {
          if (!isDelimiter) {
            node.value += c;
            if (!isLastIndex) continue;
          }

          if (node.value.length === 0 || node.value.length === 1 && Operators.includes(node.value)) {
            node = null;
          } else if (Primitives.includes(node.value)) {
            node.type = 'primitive';
          } else if (Keywords.includes(node.value)) {
            node.type = 'keyword';
          } else if (isNaN(node.value)) {
            node.type = 'identifier';
          } else {
            node.type = 'number';
          }

          if (node) {
            if (!included || included === node.type) {
              node.end = i - 1;
              nodes.push(included ? node.value : node);
            }

            node = null;
          }

          if (isDelimiter && (!included || included === type)) {
            nodes.push(included ? c : {
              start: i,
              end: i,
              value: c,
              type: type
            });
          }
        }
      } else {
        node = {
          start: i,
          end: null,
          value: isDelimiter ? '' : c
        };

        if (isQuote) {
          node.type = 'string';
        } else {
          node.type = 'unknown';
        }

        if (isDelimiter && (!included || included === type)) {
          nodes.push({
            start: i,
            end: i,
            value: c,
            type: type
          });
        }
      }
    }

    return nodes;
  }

  var DATA = new Map();
  var BINDERS = {
    class: Class,
    css: Style,
    default: Default,
    disable: Disable,
    disabled: Disable,
    each: Each,
    enable: Enable,
    enabled: Enable,
    hide: Hide,
    hidden: Hide,
    href: Href,
    html: Html,
    label: Label,
    on: On,
    read: Read,
    require: Require,
    required: Require,
    show: Show,
    showed: Show,
    style: Style,
    text: Text,
    value: Value,
    write: Write
  };
  var Binder = {
    get data() {
      return DATA;
    },

    get binders() {
      return BINDERS;
    },

    setup: function setup(options) {
      return new Promise(function ($return, $error) {
        options = options || {};
        this.data.set('location', new Map());
        this.data.set('attribute', new Map());

        for (var name in this.binders) {
          this.binders[name] = this.binders[name].bind(this);
        }

        if (options.binders) {
          for (var _name in options.binders) {
            if (_name in this.binders === false) {
              this.binders[_name] = options.binders[_name].bind(this);
            }
          }
        }

        return $return();
      }.bind(this));
    },
    get: function get(type) {
      if (!type) throw new Error('Oxe.binder.get - type argument required');
      var result = this.data.get(type);
      if (!result) return result;

      for (var i = 1, l = arguments.length; i < l; i++) {
        var argument = arguments[i];
        result = result.get(argument);

        if (!result) {
          return result;
        }
      }

      return result;
    },
    create: function create(data) {
      if (data.name === undefined) throw new Error('Oxe.binder.create - missing name');
      if (data.value === undefined) throw new Error('Oxe.binder.create - missing value');
      if (data.target === undefined) throw new Error('Oxe.binder.create - missing target');
      if (data.container === undefined) throw new Error('Oxe.binder.create - missing container');

      if (data.value.slice(0, 2) === '{{' && data.value.slice(-2) === '}}') {
        data.value = data.value.slice(2, -2);
      }

      var scope = data.container.scope;
      var names = data.names || Utility.binderNames(data.name);
      var pipes = data.pipes || Utility.binderPipes(data.value);
      var values = data.values || Utility.binderValues(data.value);
      var type = names[0];
      var path = values.join('.');
      var keys = [scope].concat(values);
      var location = keys.join('.');
      var meta = data.meta || {};
      var context = data.context || {};
      var source = type === 'on' || type === 'submit' ? data.container.methods : data.container.model;
      var expressionNames = '';
      var expressionValues = [];

      for (var i = 0, l = data.identifiers.length; i < l; i++) {
        var identifier = data.identifiers[i].split('.')[0];
        if (identifier in source === false) continue;
        expressionNames += "".concat(identifier, ",");
        Object.defineProperty(expressionValues, i, {
          get: function (name) {
            return source[name];
          }.bind(null, identifier),
          set: function (name, value) {
            console.log(name);
            console.log(value);
            return source[name] = value;
          }.bind(null, identifier)
        });
      }

      var expression = new Function(expressionNames, "\"use strict\"; return ".concat(data.value));
      return {
        get location() {
          return location;
        },

        get type() {
          return type;
        },

        get path() {
          return path;
        },

        get scope() {
          return scope;
        },

        get name() {
          return data.name;
        },

        get value() {
          return data.value;
        },

        get target() {
          return data.target;
        },

        get container() {
          return data.container;
        },

        get model() {
          return data.container.model;
        },

        get methods() {
          return data.container.methods;
        },

        get keys() {
          return keys;
        },

        get names() {
          return names;
        },

        get pipes() {
          return pipes;
        },

        get values() {
          return values;
        },

        get meta() {
          return meta;
        },

        get context() {
          return context;
        },

        get data() {
          return expression.apply(null, expressionValues);
        },

        set data(value) {
          var data = Piper(this, value);
          return Utility.setByPath(source, values, data);
        }

      };
    },
    render: function render(binder, caller) {
      if (binder.type === 'submit') return;
      var type = binder.type in this.binders ? binder.type : 'default';
      var render = this.binders[type](binder, caller);
      Batcher.batch(render);
    },
    unbind: function unbind(node) {
      this.data.get('location').forEach(function (scopes) {
        scopes.forEach(function (binders) {
          binders.forEach(function (binder, index) {
            if (binder.target === node) {
              binders.splice(index, 1);
            }
          });
        });
      });
      this.data.get('attribute').delete(node);
    },
    bind: function bind(node, name, value, context) {
      var self = this;
      var identifiers = Parse(value, 'identifier');
      var binder = self.create({
        name: name,
        value: value,
        context: context,
        identifiers: identifiers,
        target: node,
        container: context.container,
        scope: context.container.scope
      });

      if (!self.data.get('attribute').has(binder.target)) {
        self.data.get('attribute').set(binder.target, new Map());
      }

      if (!self.data.get('location').has(binder.scope)) {
        self.data.get('location').set(binder.scope, new Map());
      }

      self.data.get('attribute').get(binder.target).set(binder.name, binder);
      identifiers.forEach(function (identifier) {
        if (!self.data.get('location').get(binder.scope).has(identifier)) {
          self.data.get('location').get(binder.scope).set(identifier, []);
        }

        self.data.get('location').get(binder.scope).get(identifier).push(binder);
      });
      self.render(binder);
    },
    remove: function remove(node) {
      this.unbind(node);

      for (var i = 0; i < node.childNodes.length; i++) {
        this.remove(node.childNodes[i]);
      }
    },
    add: function add(node, context) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.indexOf('{{') === -1 || node.textContent.indexOf('}}') === -1) {
          return;
        }

        var start = node.textContent.indexOf('{{');

        if (start !== -1 && start !== 0) {
          node = node.splitText(start);
        }

        var end = node.textContent.indexOf('}}');
        var length = node.textContent.length;

        if (end !== -1 && end !== length - 2) {
          var split = node.splitText(end + 2);
          this.add(split, context);
        }

        this.bind(node, 'o-text', node.textContent, context);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        var skipChildren = false;
        var attributes = node.attributes;

        for (var i = 0, l = attributes.length; i < l; i++) {
          var attribute = attributes[i];

          if (attribute.name === 'o-html' || attribute.name === 'o-scope' || attribute.name.indexOf('o-each') === 0) {
            skipChildren = true;
          }

          if (attribute.name === 'o-value' || attribute.name === 'o-scope' || attribute.name === 'o-reset' || attribute.name === 'o-action' || attribute.name === 'o-method' || attribute.name === 'o-enctype' || attribute.name.indexOf('o-') !== 0) {
            continue;
          }

          this.bind(node, attribute.name, attribute.value, context);
        }

        if ('o-value' in attributes) {
          this.bind(node, 'o-value', attributes['o-value'].value, context);
        }

        if (skipChildren) return;

        for (var _i3 = 0; _i3 < node.childNodes.length; _i3++) {
          this.add(node.childNodes[_i3], context);
        }
      }
    }
  };

  function Change(event) {
    return new Promise(function ($return, $error) {
      if ('attributes' in event.target && 'o-value' in event.target.attributes) {
        var binder = Binder.get('attribute', event.target, 'o-value');
        Binder.render(binder, 'view');
      }

      return $return();
    });
  }

  var Fetcher = {
    headers: null,
    method: 'get',
    mime: {
      xml: 'text/xml; charset=utf-8',
      html: 'text/html; charset=utf-8',
      text: 'text/plain; charset=utf-8',
      json: 'application/json; charset=utf-8',
      js: 'application/javascript; charset=utf-8'
    },
    setup: function setup(options) {
      return new Promise(function ($return, $error) {
        options = options || {};
        this.path = options.path;
        this.origin = options.origin;
        this.request = options.request;
        this.response = options.response;
        this.acceptType = options.acceptType;
        this.credentials = options.credentials;
        this.contentType = options.contentType;
        this.responseType = options.responseType;
        this.method = options.method || this.method;
        this.headers = options.headers || this.headers;
        return $return();
      }.bind(this));
    },
    serialize: function serialize(data) {
      return new Promise(function ($return, $error) {
        var query = '';

        for (var name in data) {
          query = query.length > 0 ? query + '&' : query;
          query = query + encodeURIComponent(name) + '=' + encodeURIComponent(data[name]);
        }

        return $return(query);
      });
    },
    fetch: function fetch(options) {
      return new Promise(function ($return, $error) {
        var data, copy, result, fetched, _copy, _result2;

        data = Object.assign({}, options);
        data.path = data.path || this.path;
        data.origin = data.origin || this.origin;
        if (data.path && typeof data.path === 'string' && data.path.charAt(0) === '/') data.path = data.path.slice(1);
        if (data.origin && typeof data.origin === 'string' && data.origin.charAt(data.origin.length - 1) === '/') data.origin = data.origin.slice(0, -1);
        if (data.path && data.origin && !data.url) data.url = data.origin + '/' + data.path;
        if (!data.method) return $error(new Error('Oxe.fetcher - requires method option'));
        if (!data.url) return $error(new Error('Oxe.fetcher - requires url or origin and path option'));
        if (!data.headers && this.headers) data.headers = this.headers;
        if (typeof data.method === 'string') data.method = data.method.toUpperCase() || this.method;
        if (!data.acceptType && this.acceptType) data.acceptType = this.acceptType;
        if (!data.contentType && this.contentType) data.contentType = this.contentType;
        if (!data.responseType && this.responseType) data.responseType = this.responseType;
        if (!data.credentials && this.credentials) data.credentials = this.credentials;
        if (!data.mode && this.mode) data.mode = this.mode;
        if (!data.cache && this.cache) data.cahce = this.cache;
        if (!data.redirect && this.redirect) data.redirect = this.redirect;
        if (!data.referrer && this.referrer) data.referrer = this.referrer;
        if (!data.referrerPolicy && this.referrerPolicy) data.referrerPolicy = this.referrerPolicy;
        if (!data.signal && this.signal) data.signal = this.signal;
        if (!data.integrity && this.integrity) data.integrity = this.integrity;
        if (!data.keepAlive && this.keepAlive) data.keepAlive = this.keepAlive;

        if (data.contentType) {
          data.headers = data.headers || {};

          switch (data.contentType) {
            case 'js':
              data.headers['Content-Type'] = this.mime.js;
              break;

            case 'xml':
              data.headers['Content-Type'] = this.mime.xml;
              break;

            case 'html':
              data.headers['Content-Type'] = this.mime.html;
              break;

            case 'json':
              data.headers['Content-Type'] = this.mime.json;
              break;

            default:
              data.headers['Content-Type'] = data.contentType;
          }
        }

        if (data.acceptType) {
          data.headers = data.headers || {};

          switch (data.acceptType) {
            case 'js':
              data.headers['Accept'] = this.mime.js;
              break;

            case 'xml':
              data.headers['Accept'] = this.mime.xml;
              break;

            case 'html':
              data.headers['Accept'] = this.mime.html;
              break;

            case 'json':
              data.headers['Accept'] = this.mime.json;
              break;

            default:
              data.headers['Accept'] = data.acceptType;
          }
        }

        if (typeof this.request === 'function') {
          copy = Object.assign({}, data);
          return Promise.resolve(this.request(copy)).then(function ($await_32) {
            try {
              result = $await_32;

              if (result === false) {
                return $return(data);
              }

              if (_typeof(result) === 'object') {
                Object.assign(data, result);
              }

              return $If_4.call(this);
            } catch ($boundEx) {
              return $error($boundEx);
            }
          }.bind(this), $error);
        }

        function $If_4() {
          if (data.body) {
            if (data.method === 'GET') {
              return Promise.resolve(this.serialize(data.body)).then(function ($await_33) {
                try {
                  data.url = data.url + '?' + $await_33;
                  return $If_8.call(this);
                } catch ($boundEx) {
                  return $error($boundEx);
                }
              }.bind(this), $error);
            } else {
              if (data.contentType === 'json') {
                data.body = JSON.stringify(data.body);
              }

              return $If_8.call(this);
            }

            function $If_8() {
              return $If_5.call(this);
            }
          }

          function $If_5() {
            return Promise.resolve(window.fetch(data.url, Object.assign({}, data))).then(function ($await_34) {
              try {
                fetched = $await_34;
                data.code = fetched.status;
                data.message = fetched.statusText;

                if (!data.responseType) {
                  data.body = fetched.body;
                  return $If_6.call(this);
                } else {
                  return Promise.resolve(fetched[data.responseType === 'buffer' ? 'arrayBuffer' : data.responseType]()).then(function ($await_35) {
                    try {
                      data.body = $await_35;
                      return $If_6.call(this);
                    } catch ($boundEx) {
                      return $error($boundEx);
                    }
                  }.bind(this), $error);
                }

                function $If_6() {
                  if (this.response) {
                    _copy = Object.assign({}, data);
                    return Promise.resolve(this.response(_copy)).then(function ($await_36) {
                      try {
                        _result2 = $await_36;

                        if (_result2 === false) {
                          return $return(data);
                        }

                        if (_typeof(_result2) === 'object') {
                          Object.assign(data, _result2);
                        }

                        return $If_7.call(this);
                      } catch ($boundEx) {
                        return $error($boundEx);
                      }
                    }.bind(this), $error);
                  }

                  function $If_7() {
                    return $return(data);
                  }

                  return $If_7.call(this);
                }
              } catch ($boundEx) {
                return $error($boundEx);
              }
            }.bind(this), $error);
          }

          return $If_5.call(this);
        }

        return $If_4.call(this);
      }.bind(this));
    },
    post: function post(data) {
      return new Promise(function ($return, $error) {
        data = typeof data === 'string' ? {
          url: data
        } : data;
        data.method = 'post';
        return $return(this.fetch(data));
      }.bind(this));
    },
    get: function get(data) {
      return new Promise(function ($return, $error) {
        data = typeof data === 'string' ? {
          url: data
        } : data;
        data.method = 'get';
        return $return(this.fetch(data));
      }.bind(this));
    },
    put: function put(data) {
      return new Promise(function ($return, $error) {
        data = typeof data === 'string' ? {
          url: data
        } : data;
        data.method = 'put';
        return $return(this.fetch(data));
      }.bind(this));
    },
    head: function head(data) {
      return new Promise(function ($return, $error) {
        data = typeof data === 'string' ? {
          url: data
        } : data;
        data.method = 'head';
        return $return(this.fetch(data));
      }.bind(this));
    },
    patch: function patch(data) {
      return new Promise(function ($return, $error) {
        data = typeof data === 'string' ? {
          url: data
        } : data;
        data.method = 'patch';
        return $return(this.fetch(data));
      }.bind(this));
    },
    delete: function _delete(data) {
      return new Promise(function ($return, $error) {
        data = typeof data === 'string' ? {
          url: data
        } : data;
        data.method = 'delete';
        return $return(this.fetch(data));
      }.bind(this));
    },
    options: function options(data) {
      return new Promise(function ($return, $error) {
        data = typeof data === 'string' ? {
          url: data
        } : data;
        data.method = 'options';
        return $return(this.fetch(data));
      }.bind(this));
    },
    connect: function connect(data) {
      return new Promise(function ($return, $error) {
        data = typeof data === 'string' ? {
          url: data
        } : data;
        data.method = 'connect';
        return $return(this.fetch(data));
      }.bind(this));
    }
  };

  function Submit(event) {
    return new Promise(function ($return, $error) {
      var data, elements, i, l, element, type, binder, value, name, submit, options, result;

      if (event.target.hasAttribute('o-submit') === false) {
        return $return();
      }

      event.preventDefault();
      data = {};
      elements = event.target.querySelectorAll('*');

      for (i = 0, l = elements.length; i < l; i++) {
        element = elements[i];
        type = element.type;

        if (!type && name !== 'TEXTAREA' || type === 'submit' || type === 'button' || !type) {
          continue;
        }

        binder = Binder.get('attribute', element, 'o-value');
        value = binder ? binder.data : element.files ? element.attributes['multiple'] ? Array.prototype.slice.call(element.files) : element.files[0] : element.value;
        name = element.name || (binder ? binder.values[binder.values.length - 1] : null);
        if (!name) continue;
        data[name] = value;
      }

      submit = Binder.get('attribute', event.target, 'o-submit');
      return Promise.resolve(submit.data.call(submit.container, data, event)).then(function ($await_37) {
        try {
          options = $await_37;

          if (_typeof(options) === 'object') {
            options.url = options.url || event.target.getAttribute('o-action');
            options.method = options.method || event.target.getAttribute('o-method');
            options.contentType = options.contentType || event.target.getAttribute('o-enctype');
            return Promise.resolve(Fetcher.fetch(options)).then(function ($await_38) {
              try {
                result = $await_38;

                if (options.handler) {
                  return Promise.resolve(options.handler(result)).then(function ($await_39) {
                    try {
                      return $If_10.call(this);
                    } catch ($boundEx) {
                      return $error($boundEx);
                    }
                  }.bind(this), $error);
                }

                function $If_10() {
                  return $If_9.call(this);
                }

                return $If_10.call(this);
              } catch ($boundEx) {
                return $error($boundEx);
              }
            }.bind(this), $error);
          }

          function $If_9() {
            if (event.target.hasAttribute('o-reset') || _typeof(options) === 'object' && options.reset) {
              event.target.reset();
            }

            return $return();
          }

          return $If_9.call(this);
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }.bind(this), $error);
    });
  }

  function Input(event) {
    return new Promise(function ($return, $error) {
      if (event.target.type !== 'radio' && event.target.type !== 'option' && event.target.type !== 'checkbox' && event.target.type !== 'select-one' && event.target.type !== 'select-multiple' && 'attributes' in event.target && 'o-value' in event.target.attributes) {
        var binder = Binder.get('attribute', event.target, 'o-value');
        Binder.render(binder, 'view');
      }

      return $return();
    });
  }

  function Reset(event) {
    return new Promise(function ($return, $error) {
      if (event.target.hasAttribute('o-reset') === false) {
        return $return();
      }

      event.preventDefault();
      var elements = event.target.querySelectorAll('*');

      for (var i = 0, l = elements.length; i < l; i++) {
        var element = elements[i];
        var name = element.nodeName;
        var type = element.type;

        if (!type && name !== 'TEXTAREA' || type === 'submit' || type === 'button' || !type) {
          continue;
        }

        var binder = Binder.get('attribute', element, 'o-value');

        if (!binder) {
          if (type === 'select-one' || type === 'select-multiple') {
            element.selectedIndex = null;
          } else if (type === 'radio' || type === 'checkbox') {
            element.checked = false;
          } else {
            element.value = null;
          }
        } else if (type === 'select-one') {
          binder.data = null;
        } else if (type === 'select-multiple') {
          binder.data = [];
        } else if (type === 'radio' || type === 'checkbox') {
          binder.data = false;
        } else {
          binder.data = '';
        }
      }

      return $return();
    });
  }

  var DATA$1 = {};
  var Methods = {
    get data() {
      return DATA$1;
    },

    get: function get(path) {
      return Utility.getByPath(this.data, path);
    },
    set: function set(path, data) {
      return Utility.setByPath(this.data, path, data);
    }
  };
  var BASE;
  var Path = {
    get base() {
      if (!BASE) BASE = window.document.querySelector('base');
      if (BASE) return BASE.href;
      return window.location.origin + (window.location.pathname ? window.location.pathname : '/');
    },

    setup: function setup(option) {
      return new Promise(function ($return, $error) {
        option = option || {};

        if (option.base) {
          BASE = window.document.querySelector('base');

          if (!BASE) {
            BASE = window.document.createElement('base');
            window.document.head.insertBefore(BASE, window.document.head.firstElementChild);
          }

          BASE.href = option.base;
        }

        return $return();
      });
    },
    extension: function extension(data) {
      var position = data.lastIndexOf('.');
      return position > 0 ? data.slice(position + 1) : '';
    },
    clean: function clean(data) {
      var hash = window.location.hash;
      var search = window.location.search;
      var origin = window.location.origin;
      var protocol = window.location.protocol + '//';

      if (data.slice(0, origin.length) === origin) {
        data = data.slice(origin.length);
      }

      if (data.slice(0, protocol.length) === protocol) {
        data = data.slice(protocol.length);
      }

      if (data.slice(-hash.length) === hash) {
        data = data.slice(0, -hash.length);
      }

      if (data.slice(-search.length) === search) {
        data = data.slice(0, -search.length);
      }

      return data || '/';
    },
    normalize: function normalize(data) {
      var parser = window.document.createElement('a');
      data = this.clean(data);
      data = data.replace(/\/+/g, '/');
      parser.href = data;
      data = parser.pathname;
      data = data ? data : '/';

      if (data !== '/' && data.slice(-1) === '/') {
        data = data.slice(0, -1);
      }

      return data;
    },
    join: function join() {
      if (!arguments.length) {
        throw new Error('Oxe.path.join - argument required');
      }

      var result = [];

      for (var i = 0, l = arguments.length; i < l; i++) {
        result.push(arguments[i]);
      }

      return this.normalize(result.join('/'));
    }
  };
  var Transformer = {
    innerHandler: function innerHandler(character, index, string) {
      if (string[index - 1] === '\\') return;
      if (character === '\'') return '\\\'';
      if (character === '\"') return '\\"';
      if (character === '\t') return '\\t';
      if (character === '\r') return '\\r';
      if (character === '\n') return '\\n';
      if (character === '\w') return '\\w';
      if (character === '\b') return '\\b';
    },
    updateString: function updateString(value, index, string) {
      return string.slice(0, index) + value + string.slice(index + 1);
    },
    updateIndex: function updateIndex(value, index) {
      return index + value.length - 1;
    },
    template: function template(data) {
      var first = data.indexOf('`');
      var second = data.indexOf('`', first + 1);
      if (first === -1 || second === -1) return data;
      var value;
      var ends = 0;
      var starts = 0;
      var string = data;
      var isInner = false;

      for (var index = 0; index < string.length; index++) {
        var character = string[index];

        if (character === '`' && string[index - 1] !== '\\') {
          if (isInner) {
            ends++;
            value = '\'';
            isInner = false;
            string = this.updateString(value, index, string);
            index = this.updateIndex(value, index);
          } else {
            starts++;
            value = '\'';
            isInner = true;
            string = this.updateString(value, index, string);
            index = this.updateIndex(value, index);
          }
        } else if (isInner) {
          if (value = this.innerHandler(character, index, string)) {
            string = this.updateString(value, index, string);
            index = this.updateIndex(value, index);
          }
        }
      }

      string = string.replace(/\${(.*?)}/g, '\'+$1+\'');

      if (starts === ends) {
        return string;
      } else {
        throw new Error('import transformer missing backtick');
      }
    },
    exp: /export\s+default\s*(var|let|const)?/,
    imps: /import(?:\s+(?:\*\s+as\s+)?\w+\s+from)?\s+(?:'|").*?(?:'|");?\n?/g,
    imp: /import(?:\s+(?:\*\s+as\s+)?(\w+)\s+from)?\s+(?:'|")(.*?)(?:'|");?\n?/,
    module: function module(code, url) {
      var before = 'return Promise.all([\n';
      var after = ']).then(function ($MODULES) {\n';
      var parentImport = url.slice(0, url.lastIndexOf('/') + 1);
      var imps = code.match(this.imps) || [];

      for (var i = 0, l = imps.length; i < l; i++) {
        var imp = imps[i].match(this.imp);
        var rawImport = imp[0];
        var nameImport = imp[1];
        var pathImport = imp[2];

        if (pathImport.slice(0, 1) !== '/') {
          pathImport = Path.normalize(parentImport + '/' + pathImport);
        } else {
          pathImport = Path.normalize(pathImport);
        }

        before = before + '\t$LOADER.load("' + pathImport + '"),\n';
        after = after + 'var ' + nameImport + ' = $MODULES[' + i + '].default;\n';
        code = code.replace(rawImport, '');
      }

      if (this.exp.test(code)) {
        code = code.replace(this.exp, 'var $DEFAULT = ');
        code = code + '\n\nreturn { default: $DEFAULT };\n';
      }

      code = '"use strict";\n' + before + after + code + '});';
      return code;
    }
  };
  var Loader = {
    data: {},
    type: 'esm',
    setup: function setup(options) {
      return new Promise(function ($return, $error) {
        var self = this;
        options = options || {};
        this.type = options.type || this.type;

        if (options.loads) {
          return $return(Promise.all(options.loads.map(function (load) {
            return self.load(load);
          })));
        }

        return $return();
      }.bind(this));
    },
    fetch: function fetch(url, type) {
      return new Promise(function ($return, $error) {
        var data, code, method, result;
        return Promise.resolve(window.fetch(url)).then(function ($await_40) {
          try {
            data = $await_40;

            if (data.status == 404) {
              return $error(new Error('Oxe.loader.load - not found ' + url));
            }

            if (data.status < 200 || data.status > 300 && data.status != 304) {
              return $error(new Error(data.statusText));
            }

            return Promise.resolve(data.text()).then(function ($await_41) {
              try {
                code = $await_41;

                if (type === 'es' || type === 'est') {
                  code = Transformer.template(code);
                }

                if (type === 'es' || type === 'esm') {
                  code = Transformer.module(code, url);
                }

                var $Try_3_Post = function () {
                  try {
                    return $return();
                  } catch ($boundEx) {
                    return $error($boundEx);
                  }
                };

                var $Try_3_Catch = function (error) {
                  try {
                    throw new error.constructor("".concat(error.message, " - ").concat(url));
                  } catch ($boundEx) {
                    return $error($boundEx);
                  }
                };

                try {
                  method = new Function('window', 'document', '$LOADER', code);
                  return Promise.resolve(method(window, window.document, this)).then(function ($await_42) {
                    try {
                      result = $await_42;
                      return $return(this.data[url] = result);
                    } catch ($boundEx) {
                      return $Try_3_Catch($boundEx);
                    }
                  }.bind(this), $Try_3_Catch);
                } catch (error) {
                  $Try_3_Catch(error)
                }
              } catch ($boundEx) {
                return $error($boundEx);
              }
            }.bind(this), $error);
          } catch ($boundEx) {
            return $error($boundEx);
          }
        }.bind(this), $error);
      }.bind(this));
    },
    load: function load() {
      var $args = arguments;
      return new Promise(function ($return, $error) {
        var url, type;

        if (_typeof($args[0]) === 'object') {
          url = $args[0]['url'];
          type = $args[0]['type'];
        } else {
          url = $args[0];
          type = $args[1] || this.type;
        }

        if (!url) {
          return $error(new Error('Oxe.loader.load - url argument required'));
        }

        url = Path.normalize(url);

        if (url in this.data === false) {
          this.data[url] = this.fetch(url, type);
        }

        return $return(this.data[url]);
      }.bind(this));
    }
  };
  var Observer = {
    splice: function splice() {
      var self = this;
      var startIndex = arguments[0];
      var deleteCount = arguments[1];
      var addCount = arguments.length > 2 ? arguments.length - 2 : 0;

      if (typeof startIndex !== 'number' || typeof deleteCount !== 'number') {
        return [];
      }

      if (startIndex < 0) {
        startIndex = self.length + startIndex;
        startIndex = startIndex > 0 ? startIndex : 0;
      } else {
        startIndex = startIndex < self.length ? startIndex : self.length;
      }

      if (deleteCount < 0) {
        deleteCount = 0;
      } else if (deleteCount > self.length - startIndex) {
        deleteCount = self.length - startIndex;
      }

      var totalCount = self.$meta.length;
      var argumentIndex = 2;
      var argumentsCount = arguments.length - argumentIndex;
      var result = self.slice(startIndex, deleteCount);
      var updateCount = totalCount - 1 - startIndex;
      var promises = [];
      var length = self.length + addCount - deleteCount;

      if (self.length !== length) {
        promises.push(self.$meta.listener.bind(null, self, self.$meta.path.slice(0, -1), 'length'));
      }

      if (updateCount > 0) {
        var value;
        var _index3 = startIndex;

        while (updateCount--) {
          var key = _index3++;

          if (argumentsCount && argumentIndex < argumentsCount) {
            value = arguments[argumentIndex++];
          } else {
            value = self.$meta[_index3];
          }

          self.$meta[key] = Observer.create(value, self.$meta.listener, self.$meta.path + key);
          promises.push(self.$meta.listener.bind(null, self.$meta[key], self.$meta.path + key, key));
        }
      }

      if (addCount > 0) {
        while (addCount--) {
          var _key = self.length;

          if (_key in this === false) {
            Object.defineProperty(this, _key, Observer.descriptor(_key));
          }

          self.$meta[_key] = Observer.create(arguments[argumentIndex++], self.$meta.listener, self.$meta.path + _key);
          promises.push(self.$meta.listener.bind(null, self.$meta[_key], self.$meta.path + _key, _key));
        }
      }

      if (deleteCount > 0) {
        while (deleteCount--) {
          self.$meta.length--;
          self.length--;
          var _key2 = self.length;
          promises.push(self.$meta.listener.bind(null, undefined, self.$meta.path + _key2, _key2));
        }
      }

      Promise.resolve().then(function () {
        promises.reduce(function (promise, item) {
          return promise.then(item);
        }, Promise.resolve());
      }).catch(console.error);
      return result;
    },
    arrayProperties: function arrayProperties() {
      var self = this;
      return {
        push: {
          value: function value() {
            if (!arguments.length) return this.length;

            for (var i = 0, l = arguments.length; i < l; i++) {
              self.splice.call(this, this.length, 0, arguments[i]);
            }

            return this.length;
          }
        },
        unshift: {
          value: function value() {
            if (!arguments.length) return this.length;

            for (var i = 0, l = arguments.length; i < l; i++) {
              self.splice.call(this, 0, 0, arguments[i]);
            }

            return this.length;
          }
        },
        pop: {
          value: function value() {
            if (!this.length) return;
            var result = self.splice.call(this, this.length - 1, 1);
            return result[0];
          }
        },
        shift: {
          value: function value() {
            if (!this.length) return;
            var result = self.splice.call(this, 0, 1);
            return result[0];
          }
        },
        splice: {
          value: self.splice
        }
      };
    },
    objectProperties: function objectProperties() {
      var self = this;
      return {
        $get: {
          value: function value(key) {
            return this.$meta[key];
          }
        },
        $set: {
          value: function value(key, _value3) {
            if (_value3 !== this.$meta[key]) {
              if (key in this === false) {
                Object.defineProperty(this, key, self.descriptor(key));
              }

              this.$meta[key] = self.create(_value3, this.$meta.listener, this.$meta.path + key);
              this.$meta.listener(this.$meta[key], this.$meta.path + key, key, this);
            }
          }
        },
        $remove: {
          value: function value(key) {
            if (key in this) {
              if (this.constructor === Array) {
                return self.splice.call(this, key, 1);
              } else {
                var result = this[key];
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
    descriptor: function descriptor(key) {
      var self = this;
      return {
        enumerable: true,
        configurable: true,
        get: function get() {
          return this.$meta[key];
        },
        set: function set(value) {
          if (value !== this.$meta[key]) {
            this.$meta[key] = self.create(value, this.$meta.listener, this.$meta.path + key);
            this.$meta.listener(this.$meta[key], this.$meta.path + key, key, this);
          }
        }
      };
    },
    create: function create(source, listener, path) {
      if (!source || source.constructor !== Object && source.constructor !== Array) {
        return source;
      }

      path = path ? path + '.' : '';
      var type = source.constructor;
      var target = source.constructor();
      var descriptors = {};
      descriptors.$meta = {
        value: source.constructor()
      };
      descriptors.$meta.value.path = path;
      descriptors.$meta.value.listener = listener;

      if (type === Array) {
        for (var key = 0, length = source.length; key < length; key++) {
          descriptors.$meta.value[key] = this.create(source[key], listener, path + key);
          descriptors[key] = this.descriptor(key);
        }
      }

      if (type === Object) {
        for (var _key3 in source) {
          descriptors.$meta.value[_key3] = this.create(source[_key3], listener, path + _key3);
          descriptors[_key3] = this.descriptor(_key3);
        }
      }

      Object.defineProperties(target, descriptors);
      Object.defineProperties(target, this.objectProperties(source, listener, path));

      if (type === Array) {
        Object.defineProperties(target, this.arrayProperties(source, listener, path));
      }

      return target;
    }
  };
  var Model = {
    GET: 2,
    SET: 3,
    REMOVE: 4,
    data: null,
    tasks: [],
    target: {},
    setup: function setup(options) {
      return new Promise(function ($return, $error) {
        options = options || {};
        this.target = options.target || this.target;
        this.data = Observer.create(this.target, this.listener.bind(this));
        return $return();
      }.bind(this));
    },
    traverse: function traverse(type, keys, value) {
      var result;

      if (typeof keys === 'string') {
        keys = keys.split('.');
      }

      var data = this.data;
      var key = keys[keys.length - 1];

      for (var i = 0, l = keys.length - 1; i < l; i++) {
        if (!(keys[i] in data)) {
          if (type === this.GET || type === this.REMOVE) {
            return undefined;
          } else if (type === this.SET) {
            data.$set(keys[i], isNaN(keys[i + 1]) ? {} : []);
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
    },
    get: function get(keys) {
      return this.traverse(this.GET, keys);
    },
    remove: function remove(keys) {
      return this.traverse(this.REMOVE, keys);
    },
    set: function set(keys, value) {
      return this.traverse(this.SET, keys, value);
    },
    listener: function listener(data, location, type) {
      var parts = location.split('.');
      var part = parts.slice(1).join('.');
      var scope = parts.slice(0, 1).join('.');
      var paths = Binder.get('location', scope);
      if (!paths) return;
      paths.forEach(function (binders, path) {
        if (part === '' || path === part || type !== 'length' && path.indexOf(part + '.') === 0) {
          binders.forEach(function (binder) {
            Binder.render(binder);
          });
        }
      });
    }
  };
  var STYLE = document.createElement('style');
  var SHEET = STYLE.sheet;
  STYLE.setAttribute('title', 'oxe');
  STYLE.setAttribute('type', 'text/css');
  var Style$1 = {
    get style() {
      return STYLE;
    },

    get sheet() {
      return SHEET;
    },

    add: function add(data) {
      this.sheet.insertRule(data);
    },
    append: function append(data) {
      this.style.appendChild(document.createTextNode(data));
    },
    setup: function setup(option) {
      return new Promise(function ($return, $error) {
        option = option || {};

        if (option.style) {
          this.append(option.style);
        }

        document.head.appendChild(this.style);
        return $return();
      }.bind(this));
    }
  };
  var Definer = {
    setup: function setup() {
      return new Promise(function ($return, $error) {
        if (window.Reflect === undefined) {
          window.Reflect = window.Reflect || {};

          window.Reflect.construct = function (parent, args, child) {
            var target = child === undefined ? parent : child;
            var prototype = target.prototype || Object.prototype;
            var copy = Object.create(prototype);
            return Function.prototype.apply.call(parent, copy, args) || copy;
          };
        }

        return $return();
      });
    },
    define: function define(name, constructor) {
      constructor = constructor || function () {};

      var construct = function construct() {
        var instance = window.Reflect.construct(HTMLElement, [], this.constructor);
        constructor.call(instance);
        return instance;
      };

      var prototypes = Object.getOwnPropertyDescriptors(constructor.prototype);
      construct.prototype = Object.create(HTMLElement.prototype);
      Object.defineProperties(construct.prototype, prototypes);
      Object.defineProperty(construct.prototype, 'constructor', {
        enumerable: false,
        writable: true,
        value: construct
      });
      window.customElements.define(name, construct);
    }
  };
  var Component = {
    data: {},
    setup: function setup(options) {
      return new Promise(function ($return, $error) {
        var self = this;
        options = options || {};

        if (options.components) {
          return $return(Promise.all(options.components.map(function (component) {
            if (typeof component === 'string') {
              return Loader.load(component).then(function (load) {
                return self.define(load.default);
              });
            } else {
              return self.define(component);
            }
          })));
        }

        return $return();
      }.bind(this));
    },
    style: function style(_style, name) {
      _style = _style.replace(/\n|\r|\t/g, '');
      _style = _style.replace(/:host/g, name);

      if (!window.CSS || !window.CSS.supports || !window.CSS.supports('(--t: black)')) {
        var matches = _style.match(/--\w+(?:-+\w+)*:\s*.*?;/g) || [];

        for (var i = 0, l = matches.length; i < l; i++) {
          var match = matches[i];
          var rule = match.match(/(--\w+(?:-+\w+)*):\s*(.*?);/);
          var pattern = new RegExp('var\\(' + rule[1] + '\\)', 'g');
          _style = _style.replace(rule[0], '');
          _style = _style.replace(pattern, rule[2]);
        }
      }

      return _style;
    },
    slot: function slot(element, fragment) {
      var fragmentSlots = fragment.querySelectorAll('slot[name]');
      var defaultSlot = fragment.querySelector('slot:not([name])');

      for (var i = 0, l = fragmentSlots.length; i < l; i++) {
        var fragmentSlot = fragmentSlots[i];
        var name = fragmentSlot.getAttribute('name');
        var elementSlot = element.querySelector('[slot="' + name + '"]');

        if (elementSlot) {
          fragmentSlot.parentNode.replaceChild(elementSlot, fragmentSlot);
        } else {
          fragmentSlot.parentNode.removeChild(fragmentSlot);
        }
      }

      if (defaultSlot) {
        if (element.children.length) {
          while (element.firstChild) {
            defaultSlot.parentNode.insertBefore(element.firstChild, defaultSlot);
          }
        }

        defaultSlot.parentNode.removeChild(defaultSlot);
      }
    },
    fragment: function fragment(element, template, adopt) {
      var fragment = document.createDocumentFragment();
      var clone = template.cloneNode(true);
      var child = clone.firstElementChild;

      while (child) {
        if (!adopt) {
          Binder.add(child, {
            container: element,
            scope: element.scope
          });
        }

        fragment.appendChild(child);
        child = clone.firstElementChild;
      }

      return fragment;
    },
    render: function render(element, template, adopt, shadow) {
      if (!template) {
        return;
      }

      var fragment = this.fragment(element, template);
      var root;

      if (shadow && 'attachShadow' in document.body) {
        root = element.attachShadow({
          mode: 'open'
        });
      } else if (shadow && 'createShadowRoot' in document.body) {
        root = element.createShadowRoot();
      } else {
        if (fragment) {
          this.slot(element, fragment);
        }

        root = element;
      }

      if (fragment) {
        root.appendChild(fragment);
      }

      if (adopt) {
        var child = root.firstElementChild;

        while (child) {
          Binder.add(child, {
            container: element,
            scope: element.scope
          });
          child = child.nextElementSibling;
        }
      }
    },
    define: function define(options) {
      var self = this;

      if (_typeof(options) !== 'object') {
        return console.warn('Oxe.component.define - invalid argument type');
      }

      if (options.constructor === Array) {
        for (var i = 0, l = options.length; i < l; i++) {
          self.define(options[i]);
        }

        return;
      }

      if (!options.name) {
        return console.warn('Oxe.component.define - requires name');
      }

      options.name = options.name.toLowerCase();

      if (options.name in self.data) {
        console.log(options.name);
        return console.warn('Oxe.component.define - component defined');
      }

      self.data[options.name] = options;
      options.count = 0;
      options.model = options.model || {};
      options.adopt = options.adopt || false;
      options.methods = options.methods || {};
      options.shadow = options.shadow || false;
      options.attributes = options.attributes || [];
      options.properties = options.properties || {};

      if (options.style) {
        options.style = this.style(options.style, options.name);
        Style$1.append(options.style);
      }

      if (options.template && typeof options.template === 'string') {
        var data = document.createElement('div');
        data.innerHTML = options.template;
        options.template = data;
      }

      var constructor = function constructor() {
        this._created = false;
        this._scope = options.name + '-' + options.count++;
        var properties = Utility.clone(options.properties);
        var methods = Utility.clone(options.methods);
        var model = Utility.clone(options.model);
        Object.defineProperties(this, properties);
        Methods.set(this.scope, methods);
        Model.set(this.scope, model);
      };

      Object.defineProperties(constructor.prototype, {
        created: {
          get: function get() {
            return this._created;
          }
        },
        scope: {
          get: function get() {
            return this._scope;
          }
        },
        methods: {
          get: function get() {
            return Methods.get(this.scope);
          }
        },
        model: {
          get: function get() {
            return Model.get(this.scope);
          },
          set: function set(data) {
            return Model.set(this.scope, data && _typeof(data) === 'object' ? data : {});
          }
        },
        observedAttributes: {
          value: options.attributes
        },
        attributeChangedCallback: {
          value: function value() {
            if (options.attributed) options.attributed.apply(this, arguments);
          }
        },
        adoptedCallback: {
          value: function value() {
            if (options.adopted) options.adopted.apply(this, arguments);
          }
        },
        disconnectedCallback: {
          value: function value() {
            if (options.detached) options.detached.call(this);
          }
        },
        connectedCallback: {
          value: function value() {
            var instance = this;

            if (instance.created) {
              if (options.attached) {
                options.attached.call(instance);
              }
            } else {
              instance._created = true;
              self.render(instance, options.template, options.adopt, options.shadow);

              if (options.created && options.attached) {
                Promise.resolve().then(options.created.bind(instance)).then(options.attached.bind(instance));
              } else if (options.created) {
                Promise.resolve().then(options.created.bind(instance));
              } else if (options.attached) {
                Promise.resolve().then(options.attached.bind(instance));
              }
            }
          }
        }
      });
      Definer.define(options.name, constructor);
    }
  };

  function Listener(option, method, event) {
    var type = event.type;
    var before;
    var after;

    if (type in option.listener) {
      before = typeof option.listener[type].before === 'function' ? option.listener[type].before.bind(null, event) : null;
      after = typeof option.listener[type].after === 'function' ? option.listener[type].after.bind(null, event) : null;
    }

    Promise.resolve().then(before).then(method.bind(null, event)).then(after);
  }

  var EVENTS = {};
  var Events = {
    get events() {
      return EVENTS;
    },

    on: function on(name, method) {
      if (!(name in this.events)) {
        this.events[name] = [];
      }

      this.events[name].push(method);
    },
    off: function off(name, method) {
      if (name in this.events) {
        var _index4 = this.events[name].indexOf(method);

        if (_index4 !== -1) {
          this.events[name].splice(_index4, 1);
        }
      }
    },
    emit: function emit(name) {
      if (name in this.events) {
        var methods = this.events[name];
        var args = Array.prototype.slice.call(arguments, 2);
        Promise.all(methods.map(function (method) {
          return method.apply(this, args);
        })).catch(console.error);
      }
    }
  };
  var Event = Object.create(Events);
  var Router = {
    on: Event.on.bind(Event),
    off: Event.off.bind(Event),
    emit: Event.emit.bind(Event),
    data: [],
    ran: false,
    location: {},
    mode: 'push',
    target: null,
    contain: false,
    folder: './routes',
    setup: function setup(option) {
      return new Promise(function ($return, $error) {
        option = option || {};
        this.base = option.base === undefined ? this.base : option.base;
        this.mode = option.mode === undefined ? this.mode : option.mode;
        this.after = option.after === undefined ? this.after : option.after;
        this.folder = option.folder === undefined ? this.folder : option.folder;
        this.before = option.before === undefined ? this.before : option.before;
        this.change = option.change === undefined ? this.change : option.change;
        this.target = option.target === undefined ? this.target : option.target;
        this.contain = option.contain === undefined ? this.contain : option.contain;
        this.external = option.external === undefined ? this.external : option.external;

        if (!this.target || typeof this.target === 'string') {
          this.target = document.body.querySelector(this.target || 'o-router');
        }

        if (this.mode !== 'href') {
          window.addEventListener('popstate', this.state.bind(this), true);
          window.document.addEventListener('click', this.click.bind(this), true);
        }

        Definer.define('o-router');
        return Promise.resolve(this.add(option.routes)).then(function ($await_43) {
          try {
            return Promise.resolve(this.route(window.location.href, {
              mode: 'replace'
            })).then(function ($await_44) {
              try {
                return $return();
              } catch ($boundEx) {
                return $error($boundEx);
              }
            }, $error);
          } catch ($boundEx) {
            return $error($boundEx);
          }
        }.bind(this), $error);
      }.bind(this));
    },
    compareParts: function compareParts(routePath, userPath, split) {
      var compareParts = [];
      var routeParts = routePath.split(split);
      var userParts = userPath.split(split);

      if (userParts.length > 1 && userParts[userParts.length - 1] === '') {
        userParts.pop();
      }

      if (routeParts.length > 1 && routeParts[routeParts.length - 1] === '') {
        routeParts.pop();
      }

      for (var i = 0, l = routeParts.length; i < l; i++) {
        if (routeParts[i].slice(0, 1) === '(' && routeParts[i].slice(-1) === ')') {
          if (routeParts[i] === '(~)') {
            return true;
          } else if (routeParts[i].indexOf('~') !== -1) {
            if (userParts[i]) {
              compareParts.push(userParts[i]);
            }
          } else {
            compareParts.push(userParts[i]);
          }
        } else if (routeParts[i] !== userParts[i]) {
          return false;
        } else {
          compareParts.push(routeParts[i]);
        }
      }

      if (compareParts.join(split) === userParts.join(split)) {
        return true;
      } else {
        return false;
      }
    },
    compare: function compare(routePath, userPath) {
      var base = Path.normalize(Path.base);
      userPath = Path.normalize(userPath);
      routePath = Path.normalize(routePath);

      if (userPath.slice(0, base.length) !== base) {
        userPath = Path.join(base, userPath);
      }

      if (routePath.slice(0, base.length) !== base) {
        routePath = Path.join(base, routePath);
      }

      if (this.compareParts(routePath, userPath, '/')) {
        return true;
      }

      if (this.compareParts(routePath, userPath, '-')) {
        return true;
      }

      return false;
    },
    toParameterObject: function toParameterObject(routePath, userPath) {
      var result = {};
      if (!routePath || !userPath || routePath === '/' || userPath === '/') return result;
      var userParts = userPath.split(/\/|-/);
      var routeParts = routePath.split(/\/|-/);

      for (var i = 0, l = routeParts.length; i < l; i++) {
        var part = routeParts[i];

        if (part.slice(0, 1) === '(' && part.slice(-1) === ')') {
          var name = part.slice(1, part.length - 1).replace('~', '');
          result[name] = userParts[i];
        }
      }

      return result;
    },
    toQueryString: function toQueryString(data) {
      var result = '?';

      for (var key in data) {
        var value = data[key];
        result += key + '=' + value + '&';
      }

      if (result.slice(-1) === '&') {
        result = result.slice(0, -1);
      }

      return result;
    },
    toQueryObject: function toQueryObject(path) {
      var result = {};
      if (path.indexOf('?') === 0) path = path.slice(1);
      var queries = path.split('&');

      for (var i = 0, l = queries.length; i < l; i++) {
        var query = queries[i].split('=');

        if (query[0] && query[1]) {
          result[query[0]] = query[1];
        }
      }

      return result;
    },
    toLocationObject: function toLocationObject(href) {
      var location = {};
      var parser = document.createElement('a');
      parser.href = href;
      location.href = parser.href;
      location.host = parser.host;
      location.port = parser.port;
      location.hash = parser.hash;
      location.search = parser.search;
      location.protocol = parser.protocol;
      location.hostname = parser.hostname;
      location.pathname = parser.pathname[0] === '/' ? parser.pathname : '/' + parser.pathname;
      location.path = location.pathname + location.search + location.hash;
      return location;
    },
    scroll: function scroll(x, y) {
      window.scroll(x, y);
    },
    back: function back() {
      window.history.back();
    },
    forward: function forward() {
      window.history.forward();
    },
    redirect: function redirect(path) {
      window.location.href = path;
    },
    add: function add(data) {
      return new Promise(function ($return, $error) {
        var path, load, i, l;

        if (!data) {
          return $return();
        } else {
          if (data.constructor === String) {
            path = data;

            if (path.slice(-3) === '.js') {
              path = path.slice(0, -3);
            }

            load = path;

            if (path.slice(-5) === 'index') {
              path = path.slice(0, -5);
            }

            if (path.slice(-6) === 'index/') {
              path = path.slice(0, -6);
            }

            if (path.slice(0, 2) === './') {
              path = path.slice(2);
            }

            if (path.slice(0, 1) !== '/') {
              path = '/' + path;
            }

            load = load.replace(/\/?\((\w+)?\~\)\/?/ig, '') + '.js';
            load = Path.join(this.folder, load);
            this.data.push({
              path: path,
              load: load
            });
            return $If_12.call(this);
          } else {
            if (data.constructor === Object) {
              if (!data.path) {
                return $error(new Error('Oxe.router.add - route path required'));
              }

              if (!data.name && !data.load && !data.component) {
                return $error(new Error('Oxe.router.add -  route requires name, load, or component property'));
              }

              this.data.push(data);
              return $If_13.call(this);
            } else {
              if (data.constructor === Array) {
                i = 0, l = data.length;
                var $Loop_15_trampoline;

                function $Loop_15_step() {
                  i++;
                  return $Loop_15;
                }

                function $Loop_15() {
                  if (i < l) {
                    return Promise.resolve(this.add(data[i])).then(function ($await_45) {
                      try {
                        return $Loop_15_step;
                      } catch ($boundEx) {
                        return $error($boundEx);
                      }
                    }, $error);
                  } else return [1];
                }

                return ($Loop_15_trampoline = function (q) {
                  while (q) {
                    if (q.then) return void q.then($Loop_15_trampoline, $error);

                    try {
                      if (q.pop) {
                        if (q.length) return q.pop() ? $Loop_15_exit.call(this) : q;else q = $Loop_15_step;
                      } else q = q.call(this);
                    } catch (_exception) {
                      return $error(_exception);
                    }
                  }
                }.bind(this))($Loop_15);

                function $Loop_15_exit() {
                  return $If_14.call(this);
                }
              }

              function $If_14() {
                return $If_13.call(this);
              }

              return $If_14.call(this);
            }

            function $If_13() {
              return $If_12.call(this);
            }
          }

          function $If_12() {
            return $If_11.call(this);
          }
        }

        function $If_11() {
          return $return();
        }

        return $If_11.call(this);
      }.bind(this));
    },
    load: function load(route) {
      return new Promise(function ($return, $error) {
        var load, _load;

        if (route.load) {
          return Promise.resolve(Loader.load(route.load)).then(function ($await_46) {
            try {
              load = $await_46;
              route = Object.assign({}, load.default, route);
              return $If_17.call(this);
            } catch ($boundEx) {
              return $error($boundEx);
            }
          }.bind(this), $error);
        }

        function $If_17() {
          if (typeof route.component === 'string') {
            route.load = route.component;
            return Promise.resolve(Loader.load(route.load)).then(function ($await_47) {
              try {
                _load = $await_47;
                route.component = _load.default;
                return $If_18.call(this);
              } catch ($boundEx) {
                return $error($boundEx);
              }
            }.bind(this), $error);
          }

          function $If_18() {
            return $return(route);
          }

          return $If_18.call(this);
        }

        return $If_17.call(this);
      });
    },
    remove: function remove(path) {
      return new Promise(function ($return, $error) {
        for (var i = 0, l = this.data.length; i < l; i++) {
          if (this.data[i].path === path) {
            this.data.splice(i, 1);
          }
        }

        return $return();
      }.bind(this));
    },
    get: function get(path) {
      return new Promise(function ($return, $error) {
        var i, l;
        i = 0, l = this.data.length;
        var $Loop_19_trampoline;

        function $Loop_19_step() {
          i++;
          return $Loop_19;
        }

        function $Loop_19() {
          if (i < l) {
            if (this.data[i].path === path) {
              return Promise.resolve(this.load(this.data[i])).then(function ($await_48) {
                try {
                  this.data[i] = $await_48;
                  return $return(this.data[i]);
                } catch ($boundEx) {
                  return $error($boundEx);
                }
              }.bind(this), $error);
            }

            return $Loop_19_step;
          } else return [1];
        }

        return ($Loop_19_trampoline = function (q) {
          while (q) {
            if (q.then) return void q.then($Loop_19_trampoline, $error);

            try {
              if (q.pop) {
                if (q.length) return q.pop() ? $Loop_19_exit.call(this) : q;else q = $Loop_19_step;
              } else q = q.call(this);
            } catch (_exception) {
              return $error(_exception);
            }
          }
        }.bind(this))($Loop_19);

        function $Loop_19_exit() {
          return $return();
        }
      }.bind(this));
    },
    filter: function filter(path) {
      return new Promise(function ($return, $error) {
        var result, i, l;
        result = [];
        i = 0, l = this.data.length;
        var $Loop_22_trampoline;

        function $Loop_22_step() {
          i++;
          return $Loop_22;
        }

        function $Loop_22() {
          if (i < l) {
            if (this.compare(this.data[i].path, path)) {
              return Promise.resolve(this.load(this.data[i])).then(function ($await_49) {
                try {
                  this.data[i] = $await_49;
                  result.push(this.data[i]);
                  return $If_24.call(this);
                } catch ($boundEx) {
                  return $error($boundEx);
                }
              }.bind(this), $error);
            }

            function $If_24() {
              return $Loop_22_step;
            }

            return $If_24.call(this);
          } else return [1];
        }

        return ($Loop_22_trampoline = function (q) {
          while (q) {
            if (q.then) return void q.then($Loop_22_trampoline, $error);

            try {
              if (q.pop) {
                if (q.length) return q.pop() ? $Loop_22_exit.call(this) : q;else q = $Loop_22_step;
              } else q = q.call(this);
            } catch (_exception) {
              return $error(_exception);
            }
          }
        }.bind(this))($Loop_22);

        function $Loop_22_exit() {
          return $return(result);
        }
      }.bind(this));
    },
    find: function find(path) {
      return new Promise(function ($return, $error) {
        var i, l;
        i = 0, l = this.data.length;
        var $Loop_25_trampoline;

        function $Loop_25_step() {
          i++;
          return $Loop_25;
        }

        function $Loop_25() {
          if (i < l) {
            if (this.compare(this.data[i].path, path)) {
              return Promise.resolve(this.load(this.data[i])).then(function ($await_50) {
                try {
                  this.data[i] = $await_50;
                  return $return(this.data[i]);
                } catch ($boundEx) {
                  return $error($boundEx);
                }
              }.bind(this), $error);
            }

            return $Loop_25_step;
          } else return [1];
        }

        return ($Loop_25_trampoline = function (q) {
          while (q) {
            if (q.then) return void q.then($Loop_25_trampoline, $error);

            try {
              if (q.pop) {
                if (q.length) return q.pop() ? $Loop_25_exit.call(this) : q;else q = $Loop_25_step;
              } else q = q.call(this);
            } catch (_exception) {
              return $error(_exception);
            }
          }
        }.bind(this))($Loop_25);

        function $Loop_25_exit() {
          return $return();
        }
      }.bind(this));
    },
    render: function render(route) {
      return new Promise(function ($return, $error) {
        if (!route) {
          return $error(new Error('Oxe.render - route argument required. Missing object option.'));
        }

        if (route.title) {
          document.title = route.title;
        }

        var ensures = [];

        if (route.keywords) {
          ensures.push({
            name: 'meta',
            query: '[name="keywords"]',
            attributes: [{
              name: 'name',
              value: 'keywords'
            }, {
              name: 'content',
              value: route.keywords
            }]
          });
        }

        if (route.description) {
          ensures.push({
            name: 'meta',
            query: '[name="description"]',
            attributes: [{
              name: 'name',
              value: 'description'
            }, {
              name: 'content',
              value: route.description
            }]
          });
        }

        if (route.canonical) {
          ensures.push({
            name: 'link',
            query: '[rel="canonical"]',
            attributes: [{
              name: 'rel',
              value: 'canonical'
            }, {
              name: 'href',
              value: route.canonical
            }]
          });
        }

        if (ensures.length) {
          Promise.all(ensures.map(function (option) {
            return Promise.resolve().then(function () {
              option.position = 'afterbegin';
              option.scope = document.head;
              return Utility.ensureElement(option);
            });
          }));
        }

        if (!route.target) {
          if (!route.component) {
            Component.define(route);
            route.target = window.document.createElement(route.name);
          } else if (route.component.constructor === String) {
            route.target = window.document.createElement(route.component);
          } else if (route.component.constructor === Object) {
            Component.define(route.component);
            route.target = window.document.createElement(route.component.name);
          } else {
            return $error(new Error('Oxe.router.render - route requires name, load, or component property'));
          }
        }

        if (this.target) {
          while (this.target.firstChild) {
            this.target.removeChild(this.target.firstChild);
          }

          this.target.appendChild(route.target);
        }

        this.scroll(0, 0);
        return $return();
      }.bind(this));
    },
    route: function route(path, options) {
      return new Promise(function ($return, $error) {
        var mode, location, route;
        options = options || {};

        if (options.query) {
          path += this.toQueryString(options.query);
        }

        mode = options.mode || this.mode;
        location = this.toLocationObject(path);
        return Promise.resolve(this.find(location.pathname)).then(function ($await_51) {
          try {
            route = $await_51;

            if (!route) {
              return $error(new Error("Oxe.router.route - missing route ".concat(location.pathname)));
            }

            location.route = route;
            location.title = location.route.title;
            location.query = this.toQueryObject(location.search);
            location.parameters = this.toParameterObject(location.route.path, location.pathname);

            if (location.route && location.route.handler) {
              return Promise.resolve(location.route.handler(location)).then($return, $error);
            }

            if (location.route && location.route.redirect) {
              return Promise.resolve(this.redirect(location.route.redirect)).then($return, $error);
            }

            function $If_29() {
              if (typeof this.before === 'function') {
                return Promise.resolve(this.before(location)).then(function ($await_54) {
                  try {
                    return $If_30.call(this);
                  } catch ($boundEx) {
                    return $error($boundEx);
                  }
                }.bind(this), $error);
              }

              function $If_30() {
                this.emit('route:before', location);

                if (mode === 'href') {
                  return $return(window.location.assign(location.path));
                }

                window.history[mode + 'State']({
                  path: location.path
                }, '', location.path);
                this.location = location;
                return Promise.resolve(this.render(location.route)).then(function ($await_55) {
                  try {
                    if (typeof this.after === 'function') {
                      return Promise.resolve(this.after(location)).then(function ($await_56) {
                        try {
                          return $If_31.call(this);
                        } catch ($boundEx) {
                          return $error($boundEx);
                        }
                      }.bind(this), $error);
                    }

                    function $If_31() {
                      this.emit('route:after', location);
                      return $return();
                    }

                    return $If_31.call(this);
                  } catch ($boundEx) {
                    return $error($boundEx);
                  }
                }.bind(this), $error);
              }

              return $If_30.call(this);
            }

            if (typeof this.before === 'function') {
              return Promise.resolve(this.before(location)).then(function ($await_54) {
                try {
                  return $If_30.call(this);
                } catch ($boundEx) {
                  return $error($boundEx);
                }
              }.bind(this), $error);
            }

            function $If_30() {
              this.emit('route:before', location);

              if (mode === 'href') {
                return $return(window.location.assign(location.path));
              }

              window.history[mode + 'State']({
                path: location.path
              }, '', location.path);
              this.location = location;
              return Promise.resolve(this.render(location.route)).then(function ($await_55) {
                try {
                  if (typeof this.after === 'function') {
                    return Promise.resolve(this.after(location)).then(function ($await_56) {
                      try {
                        return $If_31.call(this);
                      } catch ($boundEx) {
                        return $error($boundEx);
                      }
                    }.bind(this), $error);
                  }

                  function $If_31() {
                    this.emit('route:after', location);
                    return $return();
                  }

                  return $If_31.call(this);
                } catch ($boundEx) {
                  return $error($boundEx);
                }
              }.bind(this), $error);
            }

            return $If_30.call(this);
          } catch ($boundEx) {
            return $error($boundEx);
          }
        }.bind(this), $error);
      }.bind(this));
    },
    state: function state(event) {
      return new Promise(function ($return, $error) {
        var path = event && event.state ? event.state.path : window.location.href;
        this.route(path, {
          mode: 'replace'
        });
        return $return();
      }.bind(this));
    },
    click: function click(event) {
      return new Promise(function ($return, $error) {
        if (event.target.type || event.button !== 0 || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
          return $return();
        }

        var target = event.path ? event.path[0] : event.target;
        var parent = target.parentElement;

        if (this.contain) {
          while (parent) {
            if (parent.nodeName === 'O-ROUTER') {
              break;
            } else {
              parent = parent.parentElement;
            }
          }

          if (parent.nodeName !== 'O-ROUTER') {
            return $return();
          }
        }

        while (target && 'A' !== target.nodeName) {
          target = target.parentElement;
        }

        if (!target || 'A' !== target.nodeName) {
          return $return();
        }

        if (target.hasAttribute('download') || target.hasAttribute('external') || target.hasAttribute('o-external') || target.href.indexOf('tel:') === 0 || target.href.indexOf('ftp:') === 0 || target.href.indexOf('file:') === 0 || target.href.indexOf('mailto:') === 0 || target.href.indexOf(window.location.origin) !== 0 || target.hash !== '' && target.origin === window.location.origin && target.pathname === window.location.pathname) return $return();
        if (this.external && (this.external.constructor === RegExp && this.external.test(target.href) || this.external.constructor === Function && this.external(target.href) || this.external.constructor === String && this.external === target.href)) return $return();
        event.preventDefault();

        if (this.location.href !== target.href) {
          this.route(target.href);
        }

        return $return();
      }.bind(this));
    }
  };
  document.head.insertAdjacentHTML('afterbegin', '<style>:not(:defined){visibility:hidden;}o-router,o-router>:first-child{display:block;}</style>');
  var oSetup = document.querySelector('script[o-setup]');

  if (oSetup) {
    Promise.resolve().then(function () {
      var attribute = oSetup.getAttribute('o-setup');

      if (!attribute) {
        throw new Error('Oxe - attribute o-setup requires arguments');
      }

      var options = attribute.split(/\s+|\s*,+\s*/);
      Loader.type = options[1] || 'esm';
      return Loader.load(options[0]);
    });
  }

  var SETUP = false;
  var GLOBAL = {};
  var index = Object.freeze({
    global: GLOBAL,
    component: Component,
    batcher: Batcher,
    definer: Definer,
    fetcher: Fetcher,
    methods: Methods,
    utility: Utility,
    binder: Binder,
    loader: Loader,
    router: Router,
    model: Model,
    style: Style$1,
    path: Path,
    setup: function setup(options) {
      var self = this;
      if (SETUP) return;else SETUP = true;
      options = options || {};
      options.listener = options.listener || {};
      document.addEventListener('input', Listener.bind(null, options, Input), true);
      document.addEventListener('reset', Listener.bind(null, options, Reset), true);
      document.addEventListener('change', Listener.bind(null, options, Change), true);
      document.addEventListener('submit', Listener.bind(null, options, Submit), true);
      return Promise.all([self.path.setup(options.path), self.style.setup(options.style), self.model.setup(options.model), self.binder.setup(options.binder), self.loader.setup(options.loader), self.definer.setup(options.definer), self.fetcher.setup(options.fetcher)]).then(function () {
        if (options.listener.before) {
          return options.listener.before();
        }
      }).then(function () {
        if (options.component) {
          return self.component.setup(options.component);
        }
      }).then(function () {
        if (options.router) {
          return self.router.setup(options.router);
        }
      }).then(function () {
        if (options.listener.after) {
          return options.listener.after();
        }
      });
    }
  });
  return index;
});