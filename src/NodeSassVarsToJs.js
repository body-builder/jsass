const colorString = require('color-string');
const kindOf = require('kind-of');

class NodeSassVarsToJs {
	constructor(options) {
		this._default_options = {};

		this._options = Object.assign({}, this._default_options, options);

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
			unit: value.getUnit()
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
			a: value.getA()
		};

		if (result.a === 1) {
			return colorString.to.hex(result.r, result.g, result.b, result.a);
		}

		return 'rgba(' + result.r + ', ' + result.g + ', ' + result.b + ', ' + result.a + ')';
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
			object[value.getKey(i).getValue()] = this._convert(value.getValue(i), options);
		}

		return object;
	}

	_convert(value, options = this._options) {
		switch (kindOf(value)) {
			case 'sassnull':
				return this._convert_null(value, options);

			case 'sassboolean':
				return this._convert_boolean(value, options);

			case 'sassnumber':
				return this._convert_number(value, options);

			case 'sasscolor':
				return this._convert_color(value, options);

			case 'sassstring':
				return this._convert_string(value, options);

			case 'sasslist':
				return this._convert_array(value, options);

			case 'sassmap':
				return this._convert_object(value, options);

			default:
				throw new Error('NodeSassVarsToJs - Unexpected node-sass variable type `' + kindOf(value) + '`');
		}
	}
}

module.exports = NodeSassVarsToJs;
