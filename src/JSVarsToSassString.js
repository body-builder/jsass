const kinfOf = require('kind-of');
const JSVarsToNodeSass = require('./JSVarsToNodeSass');
const NodeSassVarsToJs = require('./NodeSassVarsToJs');

/**
 * Converts JS variables (Bool, Number, String, Array, Object) to the 'corresponding' Sass variable definitions (Array -> List, Object -> Map, String -> String|Color|Unit, etc...)
 * Important: This Class outputs string data, which can be passed to the `data` option of node-sass (see https://github.com/sass/node-sass#data)
 */
class JSVarsToSassString extends JSVarsToNodeSass {
	/**
	 * @param options
	 * @returns {{setOption: JSVarsToSassString.setOption|*, convert: JSVarsToSassString._iterator|*}}
	 * @constructor
	 */
	constructor(options) {
		// prettier-ignore
		super(Object.assign({}, {
			syntax: 'scss',
			quotedKeys: true, // Though Sass allows map keys to be of any Sass type, it is recommended to use quoted strings to avoid confusing problems (see https://sass-lang.com/documentation/values/maps)
			listSeparator: ', ',
			quote: "'",
			flags: {
				important: false,
				default: false,
				global: false
			}
		}, options));

		this.convert = this._iterator;
		this._nodeSassVarsToJs = new NodeSassVarsToJs();

		return this;
	}

	_stringify(value, options) {
		return options.quote + value + options.quote;
	}

	_convert(value, options = this._options) {
		value = super._convert(value, options);

		// The super function may itself return value in edge-cases, and those values are in Sass types. We need to resolve it.
		if (kinfOf(value).startsWith('sass')) {
			return this._convert(this._nodeSassVarsToJs.convert(value), options);
		}

		return value;
	}

	_convert_null(value, options) {
		return JSON.stringify(null);
	}

	_convert_boolean(value, options) {
		return JSON.stringify(value);
	}

	// _convert_error is implemented only because of JSFunctionsToNodeSass, we "skip" it here.
	_convert_error(value, options) {
		throw value;
	}

	_convert_number(value, options) {
		return value;
	}

	_convert_string(value, options) {
		// Returning the value _without quotes_ in some general cases
		if (this._isVariable(value) || this._isColor(value) || this._hasUnit(value)) return value;

		return this._stringify(value, options);
	}

	_convert_array(value, options) {
		const returnArr = [];

		value.forEach((_value, index) => returnArr.push(this._convert(_value, options)));

		return '(' + returnArr.join(options.listSeparator) + ')';
	}

	_convert_object(value, options) {
		const returnObj = {};

		Object.keys(value).forEach((key, index) => (returnObj[key] = this._convert(value[key], options)));

		return '(' + Object.keys(returnObj).map((key, index) => {
			let fixedKey = key;

			if (options.quotedKeys !== false) {
				fixedKey = this._stringify(key, options);
			}

			return fixedKey + ': ' + returnObj[key];
		}).join(options.listSeparator) + ')'; // prettier-ignore
	}

	/**
	 * Creates the string value of a single Sass variable definition.
	 *
	 * @param key Name of the Sass variable
	 * @param value Value of the Sass variable
	 * @param options
	 * @returns {string}
	 */
	_createVariable(key, value, options) {
		options = Object.assign({}, this._options, options);

		const returnData = [];
		const sassKey = '$' + key;
		const sassValue = this._convert(value, options);

		returnData.push(sassKey + ': ' + sassValue);

		Object.keys(options.flags).forEach((flag) => {
			if (options.flags[flag] === true) {
				returnData.push('!' + flag);
			}
		});

		if (options.syntax === 'scss') returnData.push(';');

		return returnData.join(''); // We are joining the Array without commas
	}

	/**
	 * The main query, which iterates over the values, collects the _createVariable() responses to a JS array, and returns it as string joined with newlines.
	 *
	 * Accepts two syntaxes:
	 *  - 3 parameters: key, value, [options]
	 *  - 2 parameters: { key: value }, [options]
	 *
	 * @param values
	 * @param options
	 * @returns {string}
	 */
	_iterator(values, options) {
		if (!arguments.length) throw new Error('JSVarsToSass: no arguments provided!');

		// Converting the 3-parameters-syntax to the 2-parameters syntax
		if (!(values instanceof Object)) {
			values = { [arguments[0]]: arguments[1] };
			options = arguments[2];
		}

		const returnData = Object.keys(values).map((key) => this._createVariable(key, values[key], options));

		return returnData.join('\n');
	}
}

module.exports = JSVarsToSassString;
