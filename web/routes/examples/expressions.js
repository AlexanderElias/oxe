
export default {
    title: 'Expressions',
    path: '/expressions',
    description: 'Expressions',
    name: 'r-example-expressions',
    model: {
        evil: '',
        value: 'one',
        dynamic: 'value',
        computed: function () {
            console.log(window);
            return 'hello world';
        },
        foo: { bar: { baz: 1 } }
    },
    created: function () {
        var self = this;
    },
    template: /*html*/`

        <h3>Expressions</h3>

        <div>value: {{value}}</div>
        <div>dynamic: {{dynamic}}</div>
        <div>computed: {{computed()}}</div>
        
        <div>foo.bar.baz: {{foo.bar.baz + 2}}</div>
        <input o-value="foo.bar.baz" type="number"/>

        <br>
        <div>{{evil}}</div>
        <input o-value="evil"/>

    `
}
