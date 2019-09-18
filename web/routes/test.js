import Say from '../modules/say.js';

export default {
    title: 'Test',
    path: '/test',
    description: 'A mighty tiny web components framework/library!',
    component: {
        name: 'r-test',
        model: {
            s0: null,
            nah: null,
            isshow: null,
            ishide: null,
            toggleShowHide: null,

            lower: function (text) {
                text = text || '';
                return text.toLowerCase();
            },
            upper: function (text) {
                text = text || '';
                return text.toUpperCase();
            },

            title: 'Test',
            menuItemOne: 'Item One',
            submit: 'hello world',
            empty: {},
            blank: '',
            numRadio: 0,
            showHide: true,
            isChecked: true,
            text: 'text from test',
            loopy: { doopy: 'soopy', ra: 'ra' },
            items: [
                { it: { val: 0 } },
                { it: { val: 1 } },
                { it: { val: 2 } }
            ],
            o: [
                { n: 1, a: [ '1' ] },
                { n: 2, a: [ '2' ] },
                { n: 3, a: [ '3' ] }
            ],
            eo: {
                one: 1,
                two: 2,
                three: 3
            },
            arrayChange: [ 1, 2 ],
            html: '<h3>{{title}}</h3>'
        },
        methods: {
            say: Say,
            submit: function (data) {
                console.log(data);
            },

            overwriteArray: function () {
                this.model.arrayChange = [ 3, 4, 5, 6 ];
            },
            foo: function (e, item) {
                console.log(item);
                console.log('foo');
            },
            toggleShowHide: function () {
                this.model.showHide = !this.model.showHide;
            },
            submitGet: function () {
                console.log(arguments);
            },
            s0: function (data) {
                var model = this.model;
                if (data.username === '') {
                    model.message = 'username required';
                } else {
                    return {
                        data: data,
                        reset: true,
                        url: '/foo',
                        method: 'get',
                        handler: function (result) {
                            console.log(result);
                        }
                    };
                }
            },
            fetch: function () {
                const options = { url: 'https://jsonplaceholder.typicode.com/todos/1' };
                return Oxe.fetcher.get(options).then(console.log).catch(console.error);
            }
        },
        properties: {
            add: {
                enumerable: true,
                value: function () {
                    var total = 0;
                    for (var i = 0; i < arguments.length; i++) {
                        total += arguments[i];
                    }
                    return total;
                }
            }
        },
        created: function () {
            var self = this;

            window.self = self;

            // var total = self.add(1, 2, 3);

            // self.model.items = [
            // 	{ it: { val: 0 } },
            // 	{ it: { val: 1 } },
            // 	{ it: { val: 2 } },
            // 	{ it: { val: 3 } },
            // 	{ it: { val: 4 } },
            // ];

            // overwrite model object
            setTimeout(function () {
                console.log(JSON.stringify(self.model.loopy));
                self.model.loopy = { doopy: 'changey' };
                console.log(self.model.loopy);
                console.log(JSON.stringify(self.model.loopy));
            }, 3000);

            setTimeout(function () {
                var increaseInterval = setInterval(function () {

                    if (self.model.items.length === 6) {
                        clearInterval(increaseInterval);

                        var decreaseInterval = setInterval(function () {
                            if (self.model.items.length === 3) {
                                clearInterval(decreaseInterval);
                            } else {
                                self.model.items.pop();
                            }
                        }, 6000);

                    } else {
                        self.model.items.push({ it: { val: self.model.items.length } });
                        // console.log(self.model.items);
                    }

                }, 6000);
            }, 3000);

            Say('r-test created');

            // console.log(this.model.o);
            // [
            // 	{ n: 1, a: [ '1' ] },
            // 	{ n: 2, a: [ '2' ] },
            // 	{ n: 3, a: [ '3' ] }
            // ]

            // this.model.empty.$set({ boo: 'ha'});
        },
        template: /*html*/`
        <div id="hash"></div>

		<style>
			[o-each-item] {
				min-height: 150px;
			}
		</style>
		<br>
		<br>

		<div>
			<h3>{{title}}</h3>
		</div>
		<br>
		<br>

		<strong>{{nah}}</strong>
		<strong o-show="isshow">isshow</strong>
		<strong o-hide="ishide">ishide</strong>
		<br>
		<br>

		<form o-submit="s0" o-reset>
			<div>{{loopy.doopy}}</div>
			<input type="text" o-value="loopy.doopy" placeholder="text" required><br>
			<input type="text" o-value="blank" placeholder="text" required><br>
			<input type="submit" name="Submit">
		</form>
		<br>
		<br>

		<div o-show="showHide">Now you see me!</div>
		<button o-on-click="toggleShowHide">Show/Hide</button>
		<br>
		<br>

		<c-menu>
			<li slot="one">{{menuItemOne}}</li>
			<li slot="two">Item Two</li>
			<c-foo>
				<div slot="sub">{{text}}</div>
			</c-foo>
		</c-menu>
		<br>
		<br>

		<c-menu>
			<li>Item Three</li>
			<li>Item Four</li>
		</c-menu>
		<br>
		<br>

		<p>{{text | upper}}</p>
		<p>{{text | lower}}</p>
		<input type="text" o-value="text | lower" placeholder="text">
		<input type="text" o-value="text | upper" placeholder="text">
		<br>
		<br>

		<div>{{isChecked}}</div>
		<input type="checkbox" o-value="isChecked">
		<br>
		<br>

		<div>{{initiallyNotOnModel}}</div>
		<input type="checkbox" o-value="initiallyNotOnModel">
		<br>
		<br>

		<div>{{numRadio}}</div>
		<input type="radio" o-value="numRadio">
		<input type="radio" o-value="numRadio">
		<br>
		<br>

		<button o-on-click="say">Console Log</button>
		<br>
		<br>

		<div o-each-item="eo">
			<span>
				<span>{{$item}}</span>
				<span o-text="$item"></span>
				<span>,</span>
			</span>
		</div>
		<br>
		<br>

		<form o-submit="submit">
			<input type="text" o-value="submit"/>
			<input type="submit" value="Submit Form"/>
		</form>
		<br>
		<br>

		<ul>
			<li><a href="./test#hash">#hash</a></li>
			<li>
				<a href="./test">test</a>
			</li>
			<li>
				<a href="./js">js</a>
			</li>
			<li>
				<a href="./js?name=ferret&color=purple#hash">js?name=ferret&amp;color=purple#hash</a>
			</li>
			<li>
				<a href="./js/?name=ferret&color=purple#hash">js/?name=ferret&amp;color=purple#hash</a>
			</li>
			<li>
				<a href="https://google.com/">google</a>
			</li>
			<li>
				<a href="https://google.com/" external>google external</a>
			</li>
			<li>
				<a href="https://google.com/" target="_blank">google target_blank</a>
			</li>
		</ul>
		<br>
		<br>

		<button o-on-click="fetch">Fetch</button>
		<br>
		<br>

		<div o-html="html"></div>
		`
    }
};
