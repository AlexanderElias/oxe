import Batcher from '../batcher.js';

export default function (binder) {
    const self = this;

    const render = {
        read () {
            this.data = binder.data || [];

            if (binder.meta.keys === undefined) {
                binder.meta.keys = [];
                binder.meta.pending = false;
                binder.meta.targetLength = 0;
                binder.meta.currentLength = 0;

                binder.meta.keyVariable = binder.target.getAttribute('o-key');
                binder.meta.indexVariable = binder.target.getAttribute('o-index');

                if (binder.target.firstElementChild) {
                    binder.meta.template = binder.target.removeChild(binder.target.firstElementChild);
                } else {
                    const element = document.createElement('div');
                    const text = document.createTextNode(`{{$${binder.names[1]}}}`);
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
        write () {

            if (binder.meta.currentLength === binder.meta.targetLength) {
                binder.meta.pending = false;
                return;
            }

            if (binder.meta.currentLength > binder.meta.targetLength) {
                const element = binder.target.lastElementChild;
                binder.target.removeChild(element);
                self.remove(element);
                binder.meta.currentLength--;
            } else if (binder.meta.currentLength < binder.meta.targetLength) {
                const element = binder.meta.template.cloneNode(true);
                const index = binder.meta.currentLength++;

                self.add(element, {
                    index: index,
                    path: binder.path,
                    variable: binder.names[1],
                    container: binder.container,
                    scope: binder.container.scope,
                    key: binder.meta.keys[index],
                    keyVariable: binder.meta.keyVariable,
                    indexVariable: binder.meta.indexVariable
                });

                binder.target.appendChild(element);
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
