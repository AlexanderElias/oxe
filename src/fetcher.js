import Keeper from './Keeper.js';
import Wraper from './wraper.js';

class Fetcher {

	constructor (options) {

		this.mime = {
			xml: 'text/xml; charset=utf-8',
			html: 'text/html; charset=utf-8',
			text: 'text/plain; charset=utf-8',
			json: 'application/json; charset=utf-8',
			js: 'application/javascript; charset=utf-8'
		};

		this.setup(options);
	}

	async setup (options) {
		options = options || {};
		this.auth = options.auth || false;
		this.method = options.method || 'get';
		this.request = options.request;
		this.response = options.response;
		this.acceptType = options.acceptType;
		this.contentType = options.contentType;
		this.responseType = options.responseType;
	}

	serialize (data) {
		var string = '';

		for (var name in data) {
			string = string.length > 0 ? string + '&' : string;
			string = string + encodeURIComponent(name) + '=' + encodeURIComponent(data[name]);
		}

		return string;
	}

	change (opt) {
		var self = this;

		if (opt.xhr.readyState === 4) {

			opt.code = opt.xhr.status;
			opt.message = opt.xhr.statusText;

			if (opt.xhr['response'] !== undefined) {
				opt.data = opt.xhr.response;
			} else if (opt.xhr['responseText'] !== undefined) {
				opt.data = opt.xhr.responseText;
			}

			// NOTE this is added for IE10-11 support http://caniuse.com/#search=xhr2
			if (opt.responseType === 'json' && typeof opt.data === 'string') {

				try {
					opt.data = JSON.parse(opt.data);
				} catch (error) {
					console.warn(error);
				}

			}

			if (opt.xhr.status === 401 || opt.xhr.status === 403) {
				if (opt.auth) {
					if (Keeper.response && Keeper.response(opt) === false) {
						return;
					}
				}
			}

			var end = function () {
				if (opt.xhr.status >= 200 && opt.xhr.status < 300 || opt.xhr.status == 304) {

					if (opt.success) {
						opt.success(opt);
					} else if (opt.handler) {
						opt.error = false;
						opt.handler(opt);
					}

				} else {

					if (opt.error) {
						opt.error(opt);
					} else if (opt.handler) {
						opt.error = true;
						opt.handler(opt);
					}

				}
			};

			if (self.response) {
				Wraper(self.response.bind(null, opt), function (result) {
					if (result !== false) {
						end();
					}
				});
			} else {
				end();
			}

		}
	}

	fetch (opt) {
		var self = this;

		opt = opt || {};

		if (!opt.url) throw new Error('Oxe.fetcher - requires url options');

		opt.xhr = new XMLHttpRequest();
		opt.headers = opt.headers || {};
		opt.method = opt.method || self.method;
		opt.acceptType = opt.acceptType || self.acceptType;
		opt.contentType = opt.contentType || self.contentType;
		opt.responseType = opt.responseType || self.responseType;
		opt.auth = opt.auth === undefined || opt.auth === null ? self.auth : opt.auth;

		opt.method = opt.method.toUpperCase();

		opt.xhr.open(opt.method, opt.url, true, opt.username, opt.password);

		if (opt.contentType) {
			switch (opt.contentType) {
				case 'js': opt.headers['Content-Type'] = self.mime.js; break;
				case 'xml': opt.headers['Content-Type'] = self.mime.xml; break;
				case 'html': opt.headers['Content-Type'] = self.mime.html; break;
				case 'json': opt.headers['Content-Type'] = self.mime.json; break;
				default: opt.headers['Content-Type'] = opt.contentType;
			}
		}

		if (opt.acceptType) {
			switch (opt.acceptType) {
				case 'js': opt.headers['Accept'] = self.mime.js; break;
				case 'xml': opt.headers['Accept'] = self.mime.xml; break;
				case 'html': opt.headers['Accept'] = self.mime.html; break;
				case 'json': opt.headers['Accept'] = self.mime.json; break;
				default: opt.headers['Accept'] = opt.acceptType;
			}
		}

		if (opt.responseType) {
			switch (opt.responseType) {
				case 'text': opt.xhr.responseType = 'text'; break;
				case 'json': opt.xhr.responseType = 'json'; break;
				case 'blob': opt.xhr.responseType = 'blob'; break;
				case 'xml': opt.xhr.responseType = 'document'; break;
				case 'html': opt.xhr.responseType = 'document'; break;
				case 'document': opt.xhr.responseType = 'document'; break;
				case 'arraybuffer': opt.xhr.responseType = 'arraybuffer'; break;
				default: opt.xhr.responseType = opt.responseType;
			}
		}

		if (opt.mimeType) {
			opt.xhr.overrideMimeType(opt.mimeType);
		}

		if (opt.withCredentials) {
			opt.xhr.withCredentials = opt.withCredentials;
		}

		if (opt.headers) {
			for (var name in opt.headers) {
				opt.xhr.setRequestHeader(name, opt.headers[name]);
			}
		}

		if (opt.auth) {
			if (Keeper.request && Keeper.request(opt) === false) {
				return;
			}
		}

		var end = function () {
			var data;

			if (opt.data) {
				if (opt.method === 'GET') {
					opt.url = opt.url + '?' + self.serialize(opt.data);
				} else if (opt.contentType === 'json') {
					data = JSON.stringify(opt.data);
				} else {
					data = opt.data;
				}
			}

			opt.xhr.onreadystatechange = self.change.bind(self, opt);
			opt.xhr.send(data);
		};

		if (self.request) {
			Wraper(self.request.bind(null, opt), function (result) {
				if (result !== false) {
					end();
				}
			});
		} else {
			end();
		}

	}

	post (opt) {
		opt.method = 'post';
		return this.fetch(opt);
	}

	get (opt) {
		opt.method = 'get';
		return this.fetch(opt);
	}

	put (opt) {
		opt.method = 'put';
		return this.fetch(opt);
	}

	head (opt) {
		opt.method = 'head';
		return this.fetch(opt);
	}

	patch (opt) {
		opt.method = 'patch';
		return this.fetch(opt);
	}

	delete (opt) {
		opt.method = 'delete';
		return this.fetch(opt);
	}

	options (opt) {
		opt.method = 'options';
		return this.fetch(opt);
	}

	connect (opt) {
		opt.method = 'connect';
		return this.fetch(opt);
	}

}

export default new Fetcher();
