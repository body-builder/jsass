import { getSassImplementation, getConstructorName } from './utils';
const colorString = require('color-string');

class SassVarsToJS {
	constructor(options = {}) {
		this._default_options = {};

		this._options = Object.assign({}, this._default_options, options);
		this.implementation = getSassImplementation(this._options);

		this.convert = this._convert;

		return this;
	}

	_convert_null(value, options) {
		return null;
	}

	_convert_boolean(value, options) {
		return value.getValue();
	}

	_convert_number(value, options) {
		const result = {
			value: value.getValue(),
			unit: value.getUnit(),
		};

		if (result.unit) {
			return result.value + result.unit;
		}

		return result.value;
	}

	_convert_color(value, options) {
		const result = {
			r: value.getR(),
			g: value.getG(),
			b: value.getB(),
			a: value.getA(),
		};

		if (options.toKeyword) {
			// Returns the keyword of the given color, if it is a named color. This drops the alpha channel, if there is.
			// This also gets used internally to restore a color name in a SassList key
			const keyword = colorString.to.keyword([result.r, result.g, result.b]);
			if (keyword) {
				return keyword;
			}
		}

		if (result.a === 1) {
			return colorString.to.hex(result.r, result.g, result.b, result.a);
		}

		return colorString.to.rgb(result.r, result.g, result.b, result.a);
	}

	_convert_string(value, options) {
		return value.getValue();
	}

	_convert_array(value, options) {
		const array = [];

		for (let i = 0; i < value.getLength(); i++) {
			array.push(this._convert(value.getValue(i), options));
		}

		return array;
	}

	_convert_object(value, options) {
		const object = {};

		for (let i = 0; i < value.getLength(); i++) {
			const sassKey = value.getKey(i);
			let jsKey;

			const jsValue = this._convert(value.getValue(i), options);

			try {
				// This works in most of the cases, but some Sass types, which can also be keys of a `SassMap` (like `SassColor`) don't have a `getValue()` method.
				jsKey = sassKey.getValue();
			} catch (e) {
				switch (getConstructorName(sassKey, this.implementation)) {
					case 'SassColor':
						// Decoding the keyword of the color (or use the `hex` or `rgb()` string as a fallback).
						// We cannot decode how the `key` was named in the source file, so if it was eg. `rgba(0, 0, 0, 1)`, we willrename the JS Object property to `black`.
						// But we cover the most general use cases (like `(..., black: #000, ...)` ) properly.
						jsKey = this._convert_color(sassKey, { toKeyword: true });
						break;
					default:
						throw new Error(`Could not get key for SassMap item '${sassKey.toString()}: ${jsValue}'`);
				}
			}
			object[jsKey] = jsValue;
		}

		return object;
	}

	_convert(value, options = this._options) {
		const kindOfValue = getConstructorName(value, this.implementation);

		switch (kindOfValue) {
			case 'SassNull':
				return this._convert_null(value, options);

			case 'SassBoolean':
				return this._convert_boolean(value, options);

			case 'SassNumber':
				return this._convert_number(value, options);

			case 'SassColor':
				return this._convert_color(value, options);

			case 'SassString':
				return this._convert_string(value, options);

			case 'SassList':
			case 'SassArgumentList':
				return this._convert_array(value, options);

			case 'SassMap':
				return this._convert_object(value, options);

			default:
				// We should not fall to here, as `getConstructorName()` should catch any invalid value types.
				throw new Error('SassVarsToJS - Unexpected Sass variable type `' + kindOfValue + '`');
		}
	}
}

module.exports = SassVarsToJS;
