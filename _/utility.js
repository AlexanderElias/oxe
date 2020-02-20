
export default {

    PIPE: /\s?\|\s?/,
    PIPES: /\s?,\s?|\s+/,

    value(element, model) {

        if (!model) throw new Error('Utility.value - requires model argument');
        if (!element) throw new Error('Utility.value - requires element argument');

        const type = this.type(element);

        if (type === 'radio' || type === 'checkbox') {
            const name = this.name(element);
            const query = 'input[type="' + type + '"][name="' + name + '"]';
            const form = this.form(element);
            const elements = form ? this.form(element).querySelectorAll(query) : [element];
            const multiple = elements.length > 1;

            let result = multiple ? [] : undefined;

            for (let i = 0, l = elements.length; i < l; i++) {
                const child = elements[i];
                const checked = this.checked(child);

                if (!checked) continue;
                const value = this.value(child, model);

                if (multiple) {
                    result.push(value);
                } else {
                    result = value;
                    break;
                }

            }

            return result;
        } else if (type === 'select-one' || type === 'select-multiple') {
            const multiple = this.multiple(element);
            const options = element.options;
            let result = multiple ? [] : undefined;

            for (let i = 0, l = options.length; i < l; i++) {
                const option = options[i];
                const selected = option.selected;
                const value = this.value(option, model);
                const match = this[multiple ? 'includes' : 'compare'](this.data, value);

                // !disabled &&
                // this.data !== undefined &&

                if (selected && !match) {
                    if (this.multiple) {
                        result.push(value);
                    } else {
                        result = value;
                    }
                } else if (!selected && match) {
                    option.selected = true;
                }

            }

            return result;
            // } else if (
            //     element.nodeName === 'INPUT' || element.nodeName.indexOf('-INPUT') !== -1 ||
            // 	element.nodeName === 'OPTION' || element.nodeName.indexOf('-OPTION') !== -1 ||
            // 	element.nodeName === 'TEXTAREA' || element.nodeName.indexOf('-TEXTAREA') !== -1
            // ) {
        } else {
            const attribute = element.attributes['o-value'];
            if (attribute) {
                const values = this.binderValues(attribute.value);
                const value = this.getByPath(model, values);
                return value || element.value;
            } else {
                return element.value;
            }
        }
    },

    form(element) {
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

    type(element) {
        if (typeof element.type === 'string') {
            return element.type;
        } else {
            return element.getAttribute('type');
        }
    },

    name(element) {
        if (typeof element.name === 'string') {
            return element.name;
        } else {
            return element.getAttribute('name');
        }
    },

    checked(element) {
        if (typeof element.checked === 'boolean') {
            return element.checked;
        } else {
            switch (element.getAttribute('checked')) {
                case undefined: return false;
                case 'true': return true;
                case null: return false;
                case '': return true;
                default: return false;
            }
        }
    },

    multiple(element) {
        if (typeof element.multiple === 'boolean') {
            return element.multiple;
        } else {
            switch (element.getAttribute('multiple')) {
                case undefined: return false;
                case 'true': return true;
                case null: return false;
                case '': return true;
                default: return false;
            }
        }
    },

    disabled(element) {
        if (typeof element.disabled === 'boolean') {
            return element.disabled;
        } else {
            switch (element.getAttribute('disabled')) {
                case undefined: return false;
                case 'true': return true;
                case null: return false;
                case '': return true;
                default: return false;
            }
        }
    },

    index(items, item) {

        for (let i = 0, l = items.length; i < l; i++) {
            if (this.match(items[i], item)) {
                return i;
            }
        }

        return -1;
    },

    includes(items, item) {

        for (let i = 0, l = items.length; i < l; i++) {
            if (this.match(items[i], item)) {
                return true;
            }
        }

        return false;
    },

    match(source, target) {

        if (source === target) {
            return true;
        }

        if (source === null || source === undefined) {
            return false;
        }

        if (target === null || target === undefined) {
            return false;
        }

        if (typeof source !== typeof target) {
            return false;
        }

        if (source.constructor !== target.constructor) {
            return false;
        }

        if (typeof source !== 'object' || typeof target !== 'object') {
            return source === target;
        }

        const sourceKeys = Object.keys(source);
        const targetKeys = Object.keys(target);

        if (sourceKeys.length !== targetKeys.length) {
            return false;
        }

        for (let i = 0, l = sourceKeys.length; i < l; i++) {
            const name = sourceKeys[i];

            if (!this.match(source[name], target[name])) {
                return false;
            }

        }

        return true;
    },

    binderNames(data) {
        data = data.split('o-')[1];
        return data ? data.split('-') : [];
    },

    binderValues(data) {
        data = data.split(this.PIPE)[0];
        return data ? data.split('.') : [];
    },

    binderPipes(data) {
        data = data.split(this.PIPE)[1];
        return data ? data.split(this.PIPES) : [];
    },

    clone(source) {

        if (
            source === null ||
            source === undefined ||
            source.constructor !== Array &&
            source.constructor !== Object
        ) {
            return source;
        }

        var target = source.constructor();

        for (const name in source) {
            const descriptor = Object.getOwnPropertyDescriptor(source, name);

            if (descriptor) {

                if ('value' in descriptor) {
                    descriptor.value = this.clone(descriptor.value);
                }

                Object.defineProperty(target, name, descriptor);
            }

        }

        return target;
    }

}