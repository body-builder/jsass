import { getSassImplementation } from './utils';
const kindOf = require('kind-of');
const JSVarsToSass = require('./JSVarsToSass');
const SassVarsToJS = require('./SassVarsToJS');

class JSFunctionsToSass {
	// Credits to Jack Allan (https://stackoverflow.com/a/9924463/3111787)
	static STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
	static PARAMETER_NAMES = /([^\s,]+)/g;

	static getFunctionParams(func) {
		const fnStr = func.toString().replace(this.STRIP_COMMENTS, '');
		const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(this.PARAMETER_NAMES);

		return result || [];
	}

	constructor(options = {}) {
		this._default_options = {
			listSeparator: ', ',
			quote: "'", // prettier-ignore
		};

		this._options = Object.assign({}, this._default_options, options);
		this.implementation = getSassImplementation(this._options);

		this._jsVarsToSass = new JSVarsToSass({ implementation: this.implementation });
		this._sassVarsToJS = new SassVarsToJS({ implementation: this.implementation });

		this.convert = this._wrapObject;
	}

	/**
	 * Parses the Sass function signature and generates the parameter declaration block in it (only if even the parentheses are missing)
	 * @param signature The Sass function signature string (the `key` of the Sass `options.functions` object), eg: 'headings($from: 0, $to: 6)'
	 * @param fn
	 * @returns {*}
	 * @private
	 */
	_createSassParameterBlock(signature, fn) {
		if (kindOf(signature) !== 'string') {
			throw new Error('JSFunctionsToSass - pass the Sass function signature to _createSassParameterBlock!');
		}

		// Do not do anything if parameters are already defined (even if the parenthesis is empty - that may be a valid, intentional use-case)
		if (signature.indexOf('(') > -1 && signature.indexOf(')') > -1) {
			return signature;
		}

		const js_fn_params = this.constructor.getFunctionParams(fn);

		let sass_params;
		if (js_fn_params.length) {
			sass_params = js_fn_params.map((item) => `$${item}`).join(', ');
		} else {
			sass_params = '$arguments...';
		}

		return `${signature}(${sass_params})`;
	}

	/**
	 * Parses the Sass function signature and returns the extracted information in an Object
	 * @param signature The Sass function signature string (the `key` of the Sass `options.functions` object), eg: 'headings($from: 0, $to: 6)'
	 * @returns {null|{name: string, args: string[], spreadArgs: number[]}}
	 * @private
	 */
	_getSassFunctionData(signature) {
		const matches = signature.replace(')', '').split('(');

		// The name of the Sass function
		const name = matches[0];

		// The list of the parameters
		const args = matches[1].split(',');

		// The indexes of the parameters, which accepts spread content. This is important, as we also
		const spreadArgs = [];
		args.forEach((arg, index) => arg.endsWith('...') && spreadArgs.push(index));

		return {
			name,
			args,
			spreadArgs,
		};
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

	/**
	 * @param signature The Sass function signature (the `key` of the Sass `options.functions` object), eg: 'headings($from: 0, $to: 6)'
	 * @param fn The Javascript function to be called (the `value` of the Sass `options.functions` object)
	 * @param args The Array of the arguments which has been applied to `fn` by Sass. These are the Sass type arguments
	 * @param options Option overrides for the current JSFunctionsToSass instance
	 * @returns {*}
	 * @private
	 */
	_wrapFunction(signature, fn, args = [], options) {
		if (kindOf(fn) !== 'function') {
			throw new Error('JSFunctionsToSass - pass a function to wrapFunction!');
		}

		if (kindOf(args) !== 'array') {
			throw new Error('JSFunctionsToSass - do not forget to pass the arguments from Sass!');
		}

		options = Object.assign({}, this._options, options);

		const sassFunctionData = this._getSassFunctionData(signature);

		// Sass' asynchronous `render()` provides an additional callback as the last argument, to which we can asynchronously pass the result of the function when it’s complete.
		// We need to separate this callback from the Sass-type arguments. (`node-sass` provides a `CallbackBridge' type in synchronous mode, which we also need to separate from the Sass-type arguments.)
		const cb = args.slice(-1)[0],
			kindOfCb = kindOf(cb),
			hasCb = (kindOfCb === 'function'), // eslint-disable-line prettier/prettier
			hasFalseCb = (kindOfCb === 'callbackbridge'); // eslint-disable-line prettier/prettier

		// Removing the optional callback from the Sass function arguments list
		const sassTypeArgs = (hasCb || hasFalseCb) ? args.slice(0, -1) : args; // eslint-disable-line prettier/prettier

		// Converting raw Sass type arguments to JS
		const jsTypeArgs = [];

		sassTypeArgs.forEach((sassTypeArg, index) => {
			const jsTypeArg = this._sassVarsToJS._convert(sassTypeArg, options);

			// If the Sass function expects the arguments to be spread for the current parameter, we spread the arguments also for the JS function.
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
			if (!hasCb) {
				throw new Error('JSFunctionsToSass - no callback provided from Sass!');
			}

			// TODO Finish error handling tests
			// eslint-disable-next-line prettier/prettier
			value
				.catch((error) => cb(this._jsVarsToSass._convert(this._createError(error), options)))
				.then((resolved) => cb(this._jsVarsToSass._convert(resolved, options)));
		} else {
			return this._jsVarsToSass._convert(value, options);
		}
	}

	/**
	 * Processes the Object passed in Sass's `options.functions`. This is the main method, which will be called with the instance's `convert()` method.
	 * @param obj The `functions` property of the Sass options, which contains the function signatures (see the Sass documentation in https://sass-lang.com/documentation/js-api#functions)
	 * @param options Option overrides for the current JSFunctionsToSass instance
	 * @private
	 */
	_wrapObject(obj, options) {
		if (kindOf(obj) !== 'object') {
			throw new Error('JSFunctionsToSass - pass an object in the following format:\n{\n  \'sass-fn-name($arg1: 0, $arg2: 6)\': function(arg1, arg2) {\n    ...\n  }\n}'); // prettier-ignore
		}

		const newObj = {};

		options = Object.assign({}, this._options, options);

		Object.keys(obj).forEach((key, index) => {
			const fn = obj[key];

			const signature = this._createSassParameterBlock(key, fn);

			if (kindOf(fn) !== 'function') {
				throw new Error('JSFunctionsToSass - pass a function to wrapObject!');
			}

			newObj[signature] = (...args) => this._wrapFunction(signature, fn, args, options);
		});

		return newObj;
	}
}

module.exports = JSFunctionsToSass;
