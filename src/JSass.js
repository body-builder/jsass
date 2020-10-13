/**
 * Creates a { key: value } JS Object from the JSON generated by `sass-extract`
 * The `jSass-extract` sass-extract plugin is also using this Class for filtering the output data before writing to the bundle JS file.
 */
class JSass {
	/**
	 * @param variables
	 */
	constructor(variables) {
		this._variables = variables;

		this.get = this._get;
	}

	/**
	 * Transforms a raw Sass color definition to a pure rgba() or hexadecimal value
	 * @param value `sass-extract` raw Color definition
	 * @returns {string} rgba() value if the color has an alpha channel or hexadecimal value in case of solid colors
	 */
	_convert_color(value) {
		const rgba = 'rgba(' + value.r + ', ' + value.g + ', ' + value.b + ', ' + value.a + ')',
			hex = value.hex;

		return (value.a < 1) ? rgba : hex; // prettier-ignore
	}

	/**
	 * Recursively identifies and resolves each value of a raw Sass Map definition
	 * @param value `sass-extract` raw Map definition
	 * @returns {object} JS Object containing the Sass Map's fully resolved data
	 */
	_convert_map(value) {
		const returnData = {};

		if (!Object.keys(value).length) return returnData;

		const keys = Object.keys(value);

		for (let i = 0; i < keys.length; i++) {
			returnData[keys[i]] = this._convert(keys[i], value);
		}

		return returnData;
	}

	/**
	 * Identifies and resolves each value of a raw Sass List definition
	 * @param value
	 * @returns {Array}
	 */
	_convert_list(value) {
		const returnData = [];

		for (let i = 0; i < value.length; i++) {
			returnData.push(this._convert(i, value));
		}

		return returnData;
	}

	/**
	 * Returns the JS value of the given Sass variable
	 * @param key The name of the Sass variable
	 * @param context The selector context, if we need the value of a local variable (TODO not yet implemented in `sass-extract`)
	 * @returns {string|{}|Array|*}
	 */
	_get(key, context) {
		if (!arguments.length) throw new Error('Pass at least one argument to jSass!');

		switch (arguments.length) {
			// Variable name only
			case 1:
				return this._convert(key);

			// Variable name + context
			case 2:
				// If the second argument is a valid CSS selector, we will use it as variable context (see https://github.com/jgranstrom/sass-extract#variable-context)
				if (typeof arguments[1] === 'string' && isValidSelector(arguments[1])) {
					return this._convert(key, context);
				}
		}
	}

	/**
	 * Identifies the raw Sass type of the given Sass variable and resolves its value with the appropriate resolver
	 * @param key The name of the Sass variable
	 * @param haystack The lookup object (this._variables[context] by default, or a custom Object if the function gets called from a recursive call (this._types.map.getValue or this._types.list.getValue)
	 * @param context The selector context (TODO not yet implemented in `sass-extract`)
	 * @returns {string|{}|Array|*}
	 * @private
	 */
	_convert(key, haystack, context = 'global') {
		// We take context into account only if haystack is not set)
		haystack = haystack || this._variables[context]; // prettier-ignore

		if (haystack[key] === undefined) throw new Error('No variable found with key "' + key + '"');

		const variableVal = haystack[key];

		// If we extracted the data with `jSass-extract`
		if (!variableVal.type && !variableVal.value) return variableVal;

		switch (variableVal.type) {
			case 'SassColor':
				return this._convert_color(variableVal.value);

			case 'SassMap':
				return this._convert_map(variableVal.value);

			case 'SassList':
				return this._convert_list(variableVal.value);

			default:
				return variableVal.unit ? variableVal.value + variableVal.unit : variableVal.value;
		}
	}
}

/**
 * Checks whether the given String is a valid CSS selector
 * @see https://stackoverflow.com/a/42149818/3111787
 */
const isValidSelector = (function (selector) {
	if (typeof document === 'undefined') return true;

	const dummy = document.createElement('br');

	return function (selector) {
		try {
			dummy.querySelector(selector);
		} catch (e) {
			return false;
		}
		return true;
	};
})();

/**
 * Helper function for JSass_mod_jQuery
 * @see JSass_mod_jQuery
 * @param selector
 * @param jSass The jSass instance
 * @returns {*}
 */
function jSass_resolve(selector, jSass = window.jSass) {
	if (typeof jSass.get !== 'function') throw new Error('jSass: jSass instance not found');

	// Return the resolved value, if it's a variable
	if (typeof selector === 'string' && selector.substring(0, 1) === '$') {
		const resolved = jSass.get(selector);

		if (!isValidSelector(resolved)) {
			throw new Error('jSass: requested variable `' + resolved + '` doesn\'t seem to be a valid selector'); // prettier-ignore
		}

		return resolved;
	}
	return selector;
}

/**
 * JSass patch for jQuery to return the value of the given Sass variable (or a jQuery collection, if the value is a CSS selector)
 * Extends jQuery's init method so it checks for '$' at the beginning of the selector value. If found, tries to resolve it with jSass, and if it's a real selector, passes it to jQuery.
 * Anything else untouched, so jQuery works as expected (tested with jQuery 2.2.4 and 3.4.1).
 * @param jSass The jSass instance
 * @param jQuery The jQuery instance
 */
function JSass_mod_jQuery(jSass = window.jSass, jQuery = window.jQuery) {
	jQuery.fn.extend({
		initCore: jQuery.fn.init,
		init: function (selector, context, root) {
			return this.initCore(jSass_resolve(selector, jSass), jSass_resolve(context, jSass), root);
		},
	});

	jQuery.fn.init.prototype = jQuery.fn;
}

module.exports = {
	JSass,
	JSass_mod_jQuery,
};
