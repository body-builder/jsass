const kindOf = require('kind-of');
const JSVarsToSass = require('./JSVarsToSass');
const SassVarsToJS = require('./SassVarsToJS');

class JSFunctionsToSass {
	constructor(options = {}) {
		this._default_options = {
			listSeparator: ', ',
			quote: "'" // prettier-ignore
		};

		this._options = Object.assign({}, this._default_options, options);
		this.implementation = this._options.implementation || require('node-sass');

		this._jsVarsToSass = new JSVarsToSass({ implementation: this.implementation });
		this._sassVarsToJS = new SassVarsToJS();

		this.convert = this._wrapObject;
	}

	/**
	 * Parses the Sass function declaration string and returns the extracted information in an Object
	 * @param key The Sass function declaration string (the `key` of the Sass `options.functions` object), eg: 'headings($from: 0, $to: 6)'
	 * @returns {null|{name: string, args: string[], spreadArgs: number[]}}
	 */
	_getSassFunctionData(key) {
		const matches = key.replace(')', '').split('(');

		// The name of the Sass function
		const name = matches[0];

		// The list of the arguments
		const args = matches[1].split(',');

		// The indexes of the arguments, which accepts spread content. This is important, as we also
		const spreadArgs = [];
		args.forEach((arg, index) => arg.endsWith('...') && spreadArgs.push(index));

		if (name) {
			return {
				name,
				args,
				spreadArgs
			};
		} else {
			return null;
		}
	}

	/**
	 * Converts String `error` to an Error, or if it is already an Error, returns it as-is
	 * @param {String|Error} error
	 * @returns {Error}
	 * @private
	 */
	_createError(error) {
		// prettier-ignore
		return (error instanceof Error) ? error : new Error(error);
	}

	_wrapFunction(sass_decl, fn, args = [], options) {
		if (kindOf(sass_decl) !== 'string') {
			throw new Error('JSFunctionsToSass - pass the Sass function declaration to wrapFunction!');
		}

		if (kindOf(fn) !== 'function') {
			throw new Error('JSFunctionsToSass - pass a function to wrapFunction!');
		}

		if (kindOf(args) !== 'array') {
			throw new Error('JSFunctionsToSass - do not forget to pass the arguments from Sass!');
		}

		options = Object.assign({}, this._options, options);

		const sassFunctionData = this._getSassFunctionData(sass_decl);

		const done = args.slice(-1)[0];
		const sassTypeArgs = args.slice(0, -1);

		// Converting raw Sass type arguments to JS
		const jsTypeArgs = [];

		sassTypeArgs.forEach((sassTypeArg, index) => {
			const jsTypeArg = this._sassVarsToJS._convert(sassTypeArg, options);

			// If the Sass function expects the data to be spread for the current argument, we spread the arguments also for the JS function.
			if (kindOf(jsTypeArg) === 'array' && sassFunctionData.spreadArgs.indexOf(index) !== -1) {
				jsTypeArgs.push(...jsTypeArg);
			} else {
				jsTypeArgs.push(jsTypeArg);
			}
		});

		// Calling the given function with the transformed arguments
		let value;
		try {
			value = fn.apply(null, jsTypeArgs);
		} catch (error) {
			return this._jsVarsToSass._convert(this._createError(error), options);
		}

		// Returning JS values in Sass types
		if (value instanceof Promise) {
			if (kindOf(done) !== 'function') {
				throw new Error('JSFunctionsToSass - no callback provided from Sass!');
			}

			// TODO Finish error handling tests
			// eslint-disable-next-line prettier/prettier
			value
				.catch((error) => done(this._jsVarsToSass._convert(this._createError(error), options)))
				.then((resolved) => done(this._jsVarsToSass._convert(resolved, options)));
		} else {
			return this._jsVarsToSass._convert(value, options);
		}
	}

	_wrapObject(obj, options) {
		if (kindOf(obj) !== 'object') {
			throw new Error('JSFunctionsToSass - pass an object in the following format:\n{\n  \'sass-fn-name($arg1: 0, $arg2: 6)\': function(arg1, arg2) {\n    ...\n  }\n}'); // prettier-ignore
		}

		const newObj = {};

		options = Object.assign({}, this._options, options);

		Object.keys(obj).forEach((key, index) => {
			const fn = obj[key];

			if (kindOf(fn) !== 'function') {
				throw new Error('JSFunctionsToSass - pass a function to wrapObject!');
			}

			newObj[key] = (...args) => this._wrapFunction(key, fn, args, options);
		});

		return newObj;
	}
}

module.exports = JSFunctionsToSass;
