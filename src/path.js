
export default {

	extension (data) {
		var position = data.lastIndexOf('.');
		return position > 0 ? data.slice(position + 1) : '';
	},

	join () {
		return Array.prototype.join
			.call(arguments, '/')
			.replace(/\/{2,}/g, '/')
			.replace(/^(https?:\/)/, '$1/');
	},

	base (href) {
		var base = window.document.querySelector('base');

		if (href) {

			if (base) {
				base.href = href;
			} else {
				base = window.document.createElement('base');
				base.href = href;
				window.document.head.insertBefore(base, window.document.head.firstElementChild);
			}

		}

		return base ? base.href : window.location.origin + window.location.pathname;
	},

	resolve (path, base) {
		var result = [];

		path = path.replace(window.location.origin, '');

		if (path.indexOf('http://') === 0 || path.indexOf('https://') === 0 || path.indexOf('//') === 0) {
			return path;
		}

		if (path.charAt(0) !== '/') {
			base = base || this.base();
			path = base + '/' + path;
			path = path.replace(window.location.origin, '');
		}

		path = path.replace(/\/{2,}/, '/');
		path = path.replace(/^\//, '');
		path = path.replace(/\/$/, '');

		var paths = path.split('/');

		for (var i = 0, l = paths.length; i < l; i++) {

			if (paths[i] === '.' || paths[i] === '') {
				continue;
			} else if (paths[i] === '..') {
				
				if (i > 0) {
					result.splice(i - 1, 1);
				}
				
			} else {
				result.push(paths[i]);
			}

		}

		return '/' + result.join('/');
	}

}
