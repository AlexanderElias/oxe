
// Oxe.router.on('route:after', function () {
//     console.log('route:after');
// });

Oxe.setup({
    loader: {
        type: 'es'
    },
    fetcher: {
        request: function () {
            console.log(arguments);
        },
        response: function () {
            console.log(arguments);
        }
    },
    component: {
        components: [
            './components/c-foo.js',
            './components/c-menu.js',
            './components/o-select.js'
        ]
    },
    router: {
        // mode: 'href',
        routes: [
            'index',
            'test',
            'examples/expressions',
            'binders/each',
            'binders/class',
            'binders/select',
            'binders/style',
            'binders/text',
            'binders/value',
            '(~)'
        ]
    }
}).catch(console.error);
