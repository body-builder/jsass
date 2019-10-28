const colorString = require('color-string');
const kindOf = require('kind-of');

class JSVarsToNodeSass {
	constructor(options) {
		const _default_options = {
			listSeparator: ', ',
			strict: true
		};

		this._options = Object.assign({}, _default_options, options);
		this.implementation = this._options.implementation || require('node-sass');

		this.unitKeywords_spec = ['cm', 'mm', 'in', 'px', 'pt', 'pc', 'em', 'ex', 'ch', 'rem', 'vh', 'vw', 'vmin', 'vmax', '%'];
		this.unitKeywords_experimental = ['Q', 'cap', 'ic', 'lh', 'rlh', 'vi', 'vb'];
		this.unitKeywords = [...this.unitKeywords_spec, ...this.unitKeywords_experimental];

		this.convert = this._convert;

		return this;
	}

	_isVariable(value) {
		return value.startsWith('$');
	}

	/**
	 * Changes the configuration of the instance
	 *
	 * @param options
	 * @returns {JSVarsToSass}
	 */
	setOption(options) {
		if (!(options instanceof Object)) {
			if (arguments[1] !== undefined) {
				options = { [options]: arguments[1] };
			} else {
				throw new Error('JSVarsToNodeSass: setOption needs an option');
			}
		}

		this._options = Object.assign(this._options, options);

		return this;
	}

	/**
	 * Checks whether the given value is a valid CSS color. Returns { r: 0–255, g: 0–255, b: 0–255 a: 0–1 } if so, `false` otherwise
	 * @param value
	 * @returns {boolean|{r: Number, g: Number, b: Number, a: Number}}
	 * @private
	 */
	_isColor(value) {
		const isColor = colorString.get(value);

		if (!isColor || !isColor.value) {
			return false;
		}

		const [r, g, b, a] = isColor.value; // prettier-ignore
		return { r, g, b, a };
	}

	/**
	 * Checks whether the given value is a valid CSS number with a unit. Returns { value: Number, unit: String } if so, `false` otherwise
	 * @param value
	 * @returns {boolean}
	 * @private
	 */
	_hasUnit(value) {
		if (typeof value === 'number') return false;

		let returnObj;

		const match = this.unitKeywords.some((unit) => {
			const valueNumber = parseFloat(value), // `12` from `12px`
				valueUnit = value.replace(/\d+?/g, ''); // `px` from `12px`

			if (valueNumber + unit.toLowerCase() === value.toLowerCase()) {
				returnObj = {
					value: valueNumber,
					unit: valueUnit
				};
				return true;
			}
		});

		return match ? returnObj : match;
	}

	_convert(value, options = this._options) {
		const type = kindOf(value);

		switch (type) {
			case 'undefined':
			case 'null':
				return this._convert_null(value, options);

			case 'boolean':
				return this._convert_boolean(value, options);

			case 'number':
				return this._convert_number(value, options);

			case 'string':
				return this._convert_string(value, options);

			case 'array':
				return this._convert_array(value, options);

			case 'object':
				return this._convert_object(value, options);

			case 'error':
				return this._convert_error(value, options);

			default:
				if (this._options.strict === false) {
					return this.implementation.types.String(`[JS ${type.replace(/./, (x) => x.toUpperCase())}]`);
				} else {
					throw new Error('JSVarsToNodeSass - Unexpected variable type `' + kindOf(value) + '`');
				}
		}
	}

	_convert_null(value, options) {
		return this.implementation.types.Null.NULL;
	}

	_convert_boolean(value, options) {
		switch (value) {
			case true:
				return this.implementation.types.Boolean.TRUE;
			case false:
				return this.implementation.types.Boolean.FALSE;
		}
	}

	_convert_error(value, options) {
		return this.implementation.types.Error(value.message);
	}

	/**
	 * Converts a JS Number or a { value: Number, unit: String } object to a SassNumber instance
	 * @param value
	 * @param options
	 * @returns {*|number}
	 * @private
	 */
	_convert_number(value, options) {
		if (kindOf(value) !== 'object') {
			value = { value: value, unit: '' };
		}

		return this.implementation.types.Number(value.value, value.unit);
	}

	/**
	 * Converts a JS String to a SassString instance
	 * If the value of the string is a number with a unit, it will be converted to a SassNumber with a unit
	 * @param value
	 * @param options
	 * @returns {*|number|*|string|*}
	 * @private
	 */
	_convert_string(value, options) {
		const isColor = this._isColor(value);
		if (isColor) {
			return this._convert_color(isColor, options);
		}

		const hasUnit = this._hasUnit(value);
		if (hasUnit) {
			return this._convert_number(hasUnit, options);
		}

		return this.implementation.types.String(value);
	}

	_convert_color({ r, g, b, a }, options) {
		return new this.implementation.types.Color(r, g, b, a);
	}

	_convert_array(value, options) {
		if (kindOf(value) !== 'array') throw new Error('JSFunctionsToSass - _convert_array() needs an array, but got `' + kindOf(value) + '`');

		const list = new this.implementation.types.List(value.length, options.listSeparator.trim() === ',');

		value.map((item, index) => list.setValue(index, this._convert(item, options)));

		return list;
	}

	_convert_object(value, options) {
		if (kindOf(value) !== 'object') throw new Error('JSFunctionsToSass - _convert_object() needs an array, but got `' + kindOf(value) + '`');

		const map = new this.implementation.types.Map(Object.keys(value).length);

		Object.keys(value).map((key, index) => {
			map.setKey(index, this._convert(key, options));
			map.setValue(index, this._convert(value[key], options));
		});

		return map;
	}
}

module.exports = JSVarsToNodeSass;
