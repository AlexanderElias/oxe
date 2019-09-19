import Utility from '../utility.js';

export default function (binder, caller) {
    const self = this;
    const type = binder.target.type;

    if (binder.meta.busy) return;
    else binder.meta.busy = true;

    if (type === 'select-one' || type === 'select-multiple') {
        return {
            read() {

                this.data = binder.data;
                this.model = binder.model;
                this.options = binder.target.options;
                this.multiple = Utility.multiple(binder.target);

                if (this.multiple && (!this.data || this.data.constructor !== Array)) {
                    binder.meta.busy = false;
                    throw new Error(`Oxe - invalid o-value ${binder.keys.join('.')} multiple select requires array`);
                }

            },
            write() {
                let fallback = false;
                let fallbackSelectedAtrribute = false;
                let fallbackValue = this.multiple ? [] : null;
                let fallbackOption = this.multiple ? [] : null;

                for (let i = 0, l = this.options.length; i < l; i++) {

                    const option = this.options[i];
                    const selected = option.selected;
                    const optionBinder = self.get('attribute', option, 'o-value');
                    const optionValue = optionBinder ? optionBinder.data : option.value;
                    const selectedAtrribute = option.hasAttribute('selected');

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
                                const includes = Utility.includes(this.data, optionValue);
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
                                const index = Utility.index(this.data, optionValue);
                                if (index !== -1) {
                                    binder.data.splice(index, 1);
                                }
                            } else if (!this.selected && i === l - 1) {
                                binder.data = null;
                            }
                        }
                    } else {
                        if (this.multiple) {
                            const includes = Utility.includes(this.data, optionValue);
                            if (includes) {
                                this.selected = true;
                                option.selected = true;
                            } else {
                                option.selected = false;
                            }
                        } else {
                            if (!this.selected) {
                                const match = Utility.match(this.data, optionValue);
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
                        for (let i = 0, l = fallbackOption.length; i < l; i++) {
                            fallbackOption[i].selected = true;
                            binder.data.push(fallbackValue[i]);
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
            read() {

                this.form = binder.target.form || binder.container;
                this.query = `input[type="radio"][o-value="${binder.value}"]`;
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
            write() {
                for (let i = 0, l = this.radios.length; i < l; i++) {
                    const radio = this.radios[i];

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
            read() {

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
            write() {
                binder.target.checked = this.data;
                binder.meta.busy = false;
            }
        };
    } else if (type === 'file') {
        return {
            read() {
                this.multiple = Utility.multiple(binder.target);
                binder.data = this.multiple ? Array.prototype.slice.call(binder.target.files) : binder.target.files[0];
                binder.meta.busy = false;
                this.data = binder.data;
            },
            // write: function write() {
            // console.warn('Oxe.binder.value - setting file input is not support by browsers');
            // if (this.data !== undefined && this.data !== null && this.data.length) {
            //     Array.prototype.push.apply(binder.target.files, this.data);
            // }
            // binder.meta.busy = false;
            // }
        };
    // } else if (type === 'number') {
    } else {
        return {
            read() {

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
            write() {
                binder.target.value = this.data === undefined || this.data === null ? '' : this.data;
                binder.meta.busy = false;
            }
        };
    }
}
