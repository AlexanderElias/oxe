
export default function ensure (data) {
    data.query = data.query || '';
    data.scope = data.scope || document.body;
    data.position = data.position || 'beforeend';

    let element = data.scope.querySelector(`${data.name}${data.query}`);

    if (!element) {
        element = document.createElement(data.name);
        data.scope.insertAdjacentElement(data.position, element);
    }

    for (let i = 0, l = data.attributes.length; i < l; i++) {
        const { name, value } = data.attributes[i];
        element.setAttribute(name, value);
    }

    return element;
}