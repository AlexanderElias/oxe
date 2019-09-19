
export default {
    title: 'Value Binder',
    name: 'r-binder-value',
    model: {
        more: 's',
        number: 1,
        text: 'Hello World'
    },
    template: /*html*/`

        <h2>Value Binder</h2>
        <hr>

        <div>Text: {{text + more}}</div>
        <input o-value="text" type="text">
        <input o-value="more" type="text">

        <br>
        <br>

        <div>Number: {{ number + 4 }}</div>
        <input o-value="number" type="number">

    `
}
