import Path from './path.js';

export default {

	/*
		templates
	*/

	_innerHandler (char, index, string) {
		if (string[index-1] === '\\') return;
		if (char === '\'') return '\\\'';
		if (char === '\"') return '\\"';
		if (char === '\t') return '\\t';
		if (char === '\n') return '\\n';
	},

	_updateString (value, index, string) {
		return string.slice(0, index) + value + string.slice(index+1);
	},

	_updateIndex (value, index) {
		return index + value.length-1;
	},

	template (data) {
		// NOTE: double backtick in strings or regex could possibly causes issues

		var first = data.indexOf('`');
		var second = data.indexOf('`', first+1);

		if (first === -1 || second === -1) return data;

		var value;
		var ends = 0;
		var starts = 0;
		var string = data;
		var isInner = false;

		for (var index = 0; index < string.length; index++) {
			var char = string[index];

			if (char === '`' && string[index-1] !== '\\') {

				if (isInner) {
					ends++;
					value = '\'';
					isInner = false;
					string = this._updateString(value, index, string);
					index = this._updateIndex(value, index);
				} else {
					starts++;
					value = '\'';
					isInner = true;
					string = this._updateString(value, index, string);
					index = this._updateIndex(value, index);
				}

			} else if (isInner) {

				if (value = this._innerHandler(char, index, string)) {
					string = this._updateString(value, index, string);
					index = this._updateIndex(value, index);
				}

			}

		}

		string = string.replace(/\${(.*?)}/g, '\'+$1+\'');

		if (starts === ends) {
			return string;
		} else {
			throw new Error('Oxe - Transformer missing backtick');
		}

	},

	/*
		modules
	*/

	patterns: {
		// lines: /(.*(?:;|\n))/g,
		// line: /(.*\s*{.*\s*.*\s*}.*)|((?:\/\*|`|'|").*\s*.*\s*(?:"|'|`|\*\/))|(.*(?:;|\n))/g,
		exps: /export\s+(?:default|var|let|const)?\s+/g,
		imps: /import(?:\s+(?:\*\s+as\s+)?\w+\s+from)?\s+(?:'|").*?(?:'|")/g,
		imp: /import(?:\s+(?:\*\s+as\s+)?(\w+)\s+from)?\s+(?:'|")(.*?)(?:'|")/
	},

	getImports (text, base) {
		var result = [];
		var imps = text.match(this.patterns.imps) || [];

		for (var i = 0, l = imps.length; i < l; i++) {
			var imp = imps[i].match(this.patterns.imp);

			result[i] = {
				raw: imp[0],
				name: imp[1],
				url: Path.resolve(imp[2], base),
				extension: Path.extension(imp[2])
			};

			if (!result[i].extension) {
				result[i].url = result[i].url + '.js';
			}

		}

		return result;
	},

	getExports (text) {
		var result = [];
		var exps = text.match(this.patterns.exps) || [];

		for (var i = 0, l = exps.length; i < l; i++) {
			var exp = exps[i];

			result[i] = {
				raw: exp,
				default: exp.indexOf('default') !== -1,
			};

		}

		return result;
	},

	replaceImports (text, imps) {

		if (!imps.length) {
			return text;
		}

		for (var i = 0, l = imps.length; i < l; i++) {
			var imp = imps[i];

			var pattern = (imp.name ? 'var ' + imp.name + ' = ' : '') + '$LOADER.data[\'' + imp.url + '\'].result';

			text = text.replace(imp.raw, pattern);
		}

		return text;
	},

	replaceExports (text, exps) {

		if (!exps.length) {
			return text;
		}

		if (exps.length === 1) {
			return text.replace(exps[0].raw, 'return ');
		}

		var i, l, pattern;

		text = 'var $EXPORT = {};\n' + text;
		text = text + '\nreturn $EXPORT;\n';

		for (i = 0, l = exps.length; i < l; i++) {
			text = text.replace(exps[i].raw, '$EXPORT.');
		}

		return text;
	},

	ast (data) {
		var ast = {};

		ast.url = data.url;
		ast.raw = data.text;
		ast.cooked = data.text;
		ast.base = ast.url.slice(0, ast.url.lastIndexOf('/') + 1);

		ast.imports = this.getImports(ast.raw, ast.base);
		ast.exports = this.getExports(ast.raw);

		ast.cooked = this.replaceImports(ast.cooked, ast.imports);
		ast.cooked = this.replaceExports(ast.cooked, ast.exports);

		return ast;
	}

}
