import Change from './listener/change.js';
import Submit from './listener/submit.js';
import Input from './listener/input.js';
import Reset from './listener/reset.js';
import Click from './listener/click.js';
import State from './listener/state.js';
import Component from './component.js';
import Batcher from './batcher.js';
import Fetcher from './fetcher.js';
import Methods from './methods.js';
import Utility from './utility.js';
import Binder from './binder.js';
import Loader from './loader.js';
import Router from './router.js';
import Model from './model.js';
import Style from './style.js';
import Path from './path.js';

// custom elements with es5 classes: start
if (!window.Reflect || !window.Reflect.construct) {
    window.Reflect = window.Reflect || {};
    window.Reflect.construct = function (parent, args, child) {
        var target = child === undefined ? parent : child;
        var prototype = target.prototype || Object.prototype;
        var copy = Object.create(prototype);
        return Function.prototype.apply.call(parent, copy, args) || copy;
    };
}
// if (
// 	!(window.Reflect === undefined ||
// 	window.customElements === undefined ||
// 	window.customElements.hasOwnProperty('polyfillWrapFlushCallback'))
// ) {
// 	let htmlelement = HTMLElement;
// 	window.HTMLElement = function HTMLElement () { return Reflect.construct(htmlelement, [], this.constructor); };
// 	HTMLElement.prototype = htmlelement.prototype;
// 	HTMLElement.prototype.constructor = HTMLElement;
// 	Object.setPrototypeOf(HTMLElement, htmlelement);
// }
// custom elements with es5 classes: end

const oSetup = document.querySelector('script[o-setup]');

if (oSetup) {
    const options = oSetup.getAttribute('o-setup').split(/\s+|\s*,+\s*/);
    const meta = document.querySelector('meta[name="oxe"]');

    if (meta && meta.getAttribute('content') === 'compiled') {
        Router.compiled = true;
        Component.compiled = true;
    }

    if (!options[0]) {
        throw new Error('Oxe - script attribute o-setup requires path');
    }

    Loader.type = options[1] || 'esm';

    // might need to wait for export
    Promise.resolve(Loader.load(options[0]));
}

let SETUP = false;
const GLOBAL = {};

export default {

    get global () { return GLOBAL; },
    get window () { return window; },
    get document () { return window.document; },
    get body () { return window.document.body; },
    get head () { return window.document.head; },
    get location () { return this.router.location; },
    get currentScript () { return (window.document._currentScript || window.document.currentScript); },
    get ownerDocument () { return (window.document._currentScript || window.document.currentScript).ownerDocument; },

    get component () { return Component; },
    get batcher () { return Batcher; },
    get fetcher () { return Fetcher; },
    get methods () { return Methods; },
    get utility () { return Utility; },
    get binder () { return Binder; },
    get loader () { return Loader; },
    get router () { return Router; },
    get model () { return Model; },
    get style () { return Style; },
    get path () { return Path; },

    async setup (options) {

        if (SETUP) return;
        else SETUP = true;

        options = options || {};
        options.listener = options.listener || {};

        await this.style.setup(options.style);
        await this.model.setup(options.model);
        await this.binder.setup(options.binder);

        document.addEventListener('input', Input, true);
        document.addEventListener('click', Click, true);
        document.addEventListener('change', Change, true);
        window.addEventListener('popstate', State, true);

        document.addEventListener('reset', function (event) {
            if (event.target.hasAttribute('o-reset')) {
                event.preventDefault();

                let before;
                let after;

                if (options.listener.reset) {
                    before = typeof options.listener.reset.before === 'function' ? options.listener.reset.before.bind(null, event) : null;
                    after = typeof options.listener.reset.after === 'function' ? options.listener.reset.after.bind(null, event) : null;
                }

                Promise.resolve()
                    .then(before)
                    .then(Reset.bind(null, event))
                    .then(after);
            }
        }, true);

        document.addEventListener('submit', function (event) {
            if (event.target.hasAttribute('o-submit')) {
                event.preventDefault();

                let before;
                let after;

                if (options.listener.submit) {
                    before = typeof options.listener.submit.before === 'function' ? options.listener.submit.before.bind(null, event) : null;
                    after = typeof options.listener.submit.after === 'function' ? options.listener.submit.after.bind(null, event) : null;
                }

                Promise.resolve()
                    .then(before)
                    .then(Submit.bind(null, event))
                    .then(after);
            }
        }, true);

        if (options.listener.before) {
            await options.listener.before();
        }

        if (options.style) {
            if ('transition' in options.style) {
                window.document.documentElement.style.setProperty('--o-transition', `${options.style.transition}ms`);
            }
        }

        if (options.path) {
            await this.path.setup(options.path);
        }

        if (options.fetcher) {
            await this.fetcher.setup(options.fetcher);
        }

        if (options.loader) {
            await this.loader.setup(options.loader);
        }

        if (options.component) {
            await this.component.setup(options.component);
        }

        if (options.router) {
            await this.router.setup(options.router);
        }

        if (options.listener.after) {
            await options.listener.after();
        }

    }

};
