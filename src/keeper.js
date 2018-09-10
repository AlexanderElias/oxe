import Router from './router.js';

class Keeper {

	get token () {
		return this._token = this._token || window[this.type].getItem('token');
	}

	get user () {
		return this._user = this._user || JSON.parse(window[this.type].getItem('user'));
	}

	constructor (options) {
		this.scheme = 'Session';
		this.type = 'sessionStorage';

		this.setup(options);
	}

	async setup (options) {
		options = options || {};

		this._forbidden = options.forbidden || this._forbidden;
		this._unauthorized = options.unauthorized || this._unauthorized;
		this._authenticated = options.authenticated || this._authenticated;
		this._unauthenticated = options.unauthenticated || this._unauthenticated;

		if (options.type) {
			this.type = options.type + 'Storage';
		}

		if (options.scheme) {
			this.scheme = options.scheme.slice(0, 1).toUpperCase() + options.scheme.slice(1).toLowerCase();
		}

	}

	setToken (token) {
		if (!token) return;
		if (this.scheme === 'Basic') token = this.encode(token);
		this._token = window[this.type].setItem('token', token);
	};

	setUser (user) {
		if (!user) return;
		user = JSON.stringify(user);
		this._user = window[this.type].setItem('user', user);
	}

	removeToken () {
		this._token = null;
		window[this.type].removeItem('token');
	}

	removeUser () {
		this._user = null;
		window[this.type].removeItem('user');
	}

	authenticate (token, user) {
		this.setToken(token);
		this.setUser(user);

		if (typeof this._authenticated === 'string') {
			Router.route(this._authenticated);
		} else if (typeof this._authenticated === 'function') {
			this._authenticated();
		}

	}

	unauthenticate () {
		this.removeToken();
		this.removeUser();

		if (typeof this._unauthenticated === 'string') {
			Router.route(this._unauthenticated);
		} else if (typeof this._unauthenticated === 'function') {
			this._unauthenticated();
		}

	}

	forbidden (result) {

		if (typeof this._forbidden === 'string') {
			Router.route(this._forbidden);
		} else if (typeof this._forbidden === 'function') {
			this._forbidden(result);
		}

		return false;
	}

	unauthorized (result) {
		// NOTE might want to remove token and user
		// this.removeToken();
		// this.removeUser();

		if (typeof this._unauthorized === 'string') {
			Router.route(this._unauthorized);
		} else if (typeof this._unauthorized === 'function') {
			this._unauthorized(result);
		}

		return false;
	}

	route (result) {

		if (result.auth === false) {
			return true;
		} else if (this.scheme !== 'Session') {
			if (!this.token) {
				return this.unauthorized(result);
			} else {
				return true;
			}
		} else {
			return true;
		}

	}

	request (result) {

		if (result.auth === false) {
			return true;
		} else if (this.scheme !== 'Session') {
			if (!this.token) {
				return this.unauthorized(result);
			} else {
				result.xhr.setRequestHeader('Authorization', this.scheme + ' ' + this.token);
				return true;
			}
		} else {
			return true;
		}

	}

	response (result) {

		if (result.code === 401) {
			return this.unauthorized(result);
		} else if (result.code === 403) {
			return this.forbidden(result);
		} else {
			return true;
		}

	}

	encode (data) {
		return window.btoa(data);
	}

	decode (data) {
	    return window.atob(data);
	}

}

export default new Keeper();

/*
	https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding

	// encode (data) {
	// 	// encodeURIComponent to get percent-encoded UTF-8
	// 	// convert the percent encodings into raw bytes which
	// 	return window.btoa(window.encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, function (match, char) {
	// 		return String.fromCharCode('0x' + char);
	// 	}));
	// };
	//
	// decode (data) {
	// 	// from bytestream to percent-encoding to original string
	//     return window.decodeURIComponent(window.atob(data).split('').map(function(char) {
	//         return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2);
	//     }).join(''));
	// };
*/
