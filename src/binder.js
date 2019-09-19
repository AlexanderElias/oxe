import Utility from './utility.js';
import Batcher from './batcher.js';
import Piper from './piper.js';

import Class from './binder/class.js';
import Default from './binder/default.js';
import Disable from './binder/disable.js';
import Each from './binder/each.js';
import Enable from './binder/enable.js';
import Hide from './binder/hide.js';
import Href from './binder/href.js';
import Html from './binder/html.js';
import Label from './binder/label.js';
import On from './binder/on.js';
import Read from './binder/read.js';
import Require from './binder/require.js';
import Show from './binder/show.js';
import Style from './binder/style.js';
import Text from './binder/text.js';
import Value from './binder/value.js';
import Write from './binder/write.js';

import Parse from './utility/parse.js';

const DATA = new Map();

const BINDERS = {
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

export default {

    get data() { return DATA; },
    get binders() { return BINDERS; },

    async setup(options) {
        options = options || {};

        this.data.set('location', new Map());
        this.data.set('attribute', new Map());

        for (const name in this.binders) {
            this.binders[name] = this.binders[name].bind(this);
        }

        if (options.binders) {

            for (const name in options.binders) {

                if (name in this.binders === false) {
                    this.binders[name] = options.binders[name].bind(this);
                }

            }

        }

    },

    get(type) {

        if (!type) throw new Error('Oxe.binder.get - type argument required');

        let result = this.data.get(type);

        if (!result) return result;

        for (let i = 1, l = arguments.length; i < l; i++) {
            const argument = arguments[i];
            result = result.get(argument);

            if (!result) {
                return result;
            }

        }

        return result;
    },

    create(data) {

        if (data.name === undefined) throw new Error('Oxe.binder.create - missing name');
        if (data.value === undefined) throw new Error('Oxe.binder.create - missing value');
        if (data.target === undefined) throw new Error('Oxe.binder.create - missing target');
        if (data.container === undefined) throw new Error('Oxe.binder.create - missing container');

        if (data.value.slice(0, 2) === '{{' && data.value.slice(-2) === '}}') {
            data.value = data.value.slice(2, -2);
        }
        
        // if (data.value.indexOf('$') !== -1 && data.context && data.context.variable && data.context.path && data.context.key) {
        //     const pattern = new RegExp(`\\$${data.context.variable}(,|\\s+|\\.|\\|)?(.*)?$`, 'ig');
        //     data.value = data.value.replace(pattern, `${data.context.path}.${data.context.key}$1$2`);
        // }

        const scope = data.container.scope;
        const names = data.names || Utility.binderNames(data.name);
        const pipes = data.pipes || Utility.binderPipes(data.value);
        const values = data.values || Utility.binderValues(data.value);

        const type = names[0];
        const path = values.join('.');
        const keys = [scope].concat(values);
        const location = keys.join('.');

        const meta = data.meta || {};
        const context = data.context || {};
        const source = type === 'on' || type === 'submit' ? data.container.methods : data.container.model;

        let expressionNames = '';
        const expressionValues = [];
        for (let i = 0, l = data.identifiers.length; i < l; i++) {
            const identifier = data.identifiers[i].split('.')[0];
            if (identifier in source === false) continue;
            expressionNames += `${identifier},`;
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
        const expression = new Function(expressionNames, `"use strict"; return ${data.value}`);

        return {
            get location() { return location; },

            get type() { return type; },
            get path() { return path; },
            get scope() { return scope; },

            get name() { return data.name; },
            get value() { return data.value; },
            get target() { return data.target; },
            get container() { return data.container; },
            get model() { return data.container.model; },
            get methods() { return data.container.methods; },

            get keys() { return keys; },
            get names() { return names; },
            get pipes() { return pipes; },
            get values() { return values; },

            get meta() { return meta; },
            get context() { return context; },

            // get originalValue () { return originalValue; },

            get data() {
                // const data = Utility.getByPath(source, values);
                // return Piper(this, data);
                return expression.apply(null, expressionValues);
            },

            set data(value) {
                const data = Piper(this, value);
                return Utility.setByPath(source, values, data);
                // const setExpression = new Function(`${expressionNames}$VALUE`, `"use strict"; return ${data.value} = $VALUE;`);
                // console.log(setExpression);
                // return setExpression.apply(null, expressionValues.concat(value));
            }

        };
    },

    render(binder, caller) {

        if (binder.type === 'submit') return;

        const type = binder.type in this.binders ? binder.type : 'default';
        const render = this.binders[type](binder, caller);

        Batcher.batch(render);
    },

    unbind(node) {

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

    bind(node, name, value, context) {
        const self = this;

        // if (value === `$${context.variable}.$key` || value === `{{$${context.variable}.$key}}`) {
        //     return Batcher.batch({ write() { node.textContent = context.key; } });
        // }

        // if (value === `$${context.variable}.$index` || value === `{{$${context.variable}.$index}}`) {
        //     return Batcher.batch({ write() { node.textContent = context.index; } });
        // }

        const identifiers = Parse(value, 'identifier');

        const binder = self.create({
            name,
            value,
            context,
            identifiers,
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
        // this.render(binder, 'view');
    },


    remove(node) {

        this.unbind(node);

        for (let i = 0; i < node.childNodes.length; i++) {
            this.remove(node.childNodes[i]);
        }

    },

    add(node, context) {
        if (node.nodeType === Node.TEXT_NODE) {

            if (node.textContent.indexOf('{{') === -1 || node.textContent.indexOf('}}') === -1) {
                return;
            }

            const start = node.textContent.indexOf('{{');
            if (start !== -1 && start !== 0) {
                node = node.splitText(start);
            }

            const end = node.textContent.indexOf('}}');
            const length = node.textContent.length;
            if (end !== -1 && end !== length - 2) {
                const split = node.splitText(end + 2);
                this.add(split, context);
            }

            this.bind(node, 'o-text', node.textContent, context);

        } else if (node.nodeType === Node.ELEMENT_NODE) {
            let skipChildren = false;

            const attributes = node.attributes;
            for (let i = 0, l = attributes.length; i < l; i++) {
                const attribute = attributes[i];

                // idea
                // if (
                //     attribute.name.indexOf('{{') === 0 &&
                //     attribute.name.indexOf('}}') === attribute.name.length-2
                // ) {
                // }

                // invisble char idea
                // if (attribute.value.indexOf('{{') !== -1 && attribute.value.indexOf('}}') !== -1) {

                //     var f = false;
                //     var start = attribute.textContent.indexOf('{{');
        
                //     if (start !== -1 && start !== 0) {
                //       f = true;
                //       attribute.value = attribute.value.slice(0, start) + '\u200C' + attribute.value.slice(start);
                //     }
        
                //     var end = attribute.textContent.indexOf('}}');
                //     var length = attribute.textContent.length;
        
                //     if (f) {
                //       attribute.value = attribute.value.slice(0, end+2) + '\u200C' + attribute.value.slice(end+2);
                //     }

                // }

                if (
                    attribute.name === 'o-html' ||
                    attribute.name === 'o-scope' ||
                    attribute.name.indexOf('o-each') === 0
                ) {
                    skipChildren = true;
                }

                if (
                    attribute.name === 'o-value' ||
                    attribute.name === 'o-scope' ||
                    attribute.name === 'o-reset' ||
                    attribute.name === 'o-action' ||
                    attribute.name === 'o-method' ||
                    attribute.name === 'o-enctype' ||
                    attribute.name.indexOf('o-') !== 0
                ) {
                    continue;
                }

                this.bind(node, attribute.name, attribute.value, context);
            }

            // priorities o-each
            if ('o-value' in attributes) {
                this.bind(node, 'o-value', attributes['o-value'].value, context);
            }

            if (skipChildren) return;

            for (let i = 0; i < node.childNodes.length; i++) {
                this.add(node.childNodes[i], context);
            }

        }
    }

};
