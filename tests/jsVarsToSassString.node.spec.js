const JSVarsToSassString = require('../src/JSVarsToSassString');
const jsVarsToSassString = new JSVarsToSassString();

describe('jsVarsToSassString', function() {
	it('Should handle both the 3-parameters and the 2-parameters syntax', function() {
		expect(jsVarsToSassString.convert('number', 0.454)).toEqual('$number: 0.454;');
		expect(jsVarsToSassString.convert({ number: 0.454 })).toEqual('$number: 0.454;');
	});

	it('Should throw error if the given value cannot be converted', function() {
		// TODO A JS Map may be converted to a Sass Map, isn't it?
		expect(() => jsVarsToSassString.convert('js-map', new Map([['a', 'a'], ['b', 'b'], ['c', 'c']]))).toThrow(new Error('JSVarsToNodeSass - Unexpected variable type `map`'));
	});

	it('Should create a Sass variable with value `null` if no value given', function() {
		// TODO Should it? Shouldn't it rather throw error?
		expect(jsVarsToSassString.convert('undefined')).toEqual('$undefined: null;');
	});

	it('Should keep or remove quotes in value according to the Sass value type (Boolean, String, variable reference, Number, Color, Null)', function() {
		// Booleans
		expect(jsVarsToSassString.convert('true', true)).toEqual('$true: true;');
		expect(jsVarsToSassString.convert('false', false)).toEqual('$false: false;');

		// Strings
		expect(jsVarsToSassString.convert('string', 'string')).toEqual(`$string: 'string';`);

		// Variable references
		expect(jsVarsToSassString.convert('variable', '$variable')).toEqual('$variable: $variable;');

		// Numbers (without/with units)
		expect(jsVarsToSassString.convert('number', 0.454)).toEqual('$number: 0.454;');
		expect(jsVarsToSassString.convert('unit', '12px')).toEqual('$unit: 12px;');
		expect(jsVarsToSassString.convert('percentage', '20%')).toEqual('$percentage: 20%;');

		// Colors
		expect(jsVarsToSassString.convert('color', '#99ccff')).toEqual('$color: #99ccff;');
		expect(jsVarsToSassString.convert('color', 'red')).toEqual('$color: red;');

		// Null
		expect(jsVarsToSassString.convert('null', null)).toEqual('$null: null;');
	});

	it('Should convert JS types to the Sass equivalents', function() {
		expect(jsVarsToSassString.convert('singleArray', ['elem1'])).toEqual(`$singleArray: ('elem1');`);
		expect(jsVarsToSassString.convert('array', [true, false, 'string', '$variable', 3.4e33, '12px', '#ffffff', 'red'])).toEqual(`$array: (true, false, 'string', $variable, 3.4e+33, 12px, #ffffff, red);`);
		expect(jsVarsToSassString.convert('nestedArray', ['elem1', ['elem2', 'elem3'], 'elem4'])).toEqual(`$nestedArray: ('elem1', ('elem2', 'elem3'), 'elem4');`);
		// TODO different list separator?
		expect(
			jsVarsToSassString.convert('map', {
				bool: true,
				string: 'string',
				variable: '$variable',
				color: 'rgb(100, 110, 100)',
				unit: '12px',
				array: ['arrelem1', 'arrelem2', 'arrelem3'],
				map: { prop1: 'mappropelem1', prop2: 'mappropelem2', prop3: 'mappropelem3' }
			})
		).toEqual(
			`$map: ('bool': true, 'string': 'string', 'variable': $variable, 'color': rgb(100, 110, 100), 'unit': 12px, 'array': ('arrelem1', 'arrelem2', 'arrelem3'), 'map': ('prop1': 'mappropelem1', 'prop2': 'mappropelem2', 'prop3': 'mappropelem3'));`
		);
	});

	it('Should accept an object of variable definitions', function() {
		expect(
			jsVarsToSassString.convert({
				undefined: null,
				map: {
					bool: true,
					string: 'string',
					variable: '$variable',
					color: 'rgb(100, 110, 100)',
					unit: '12px',
					array: ['arrelem1', 'arrelem2', 'arrelem3'],
					map: { prop1: 'mappropelem1', prop2: 'mappropelem2', prop3: 'mappropelem3' }
				}
			})
		).toEqual(
			`$undefined: null;\n$map: ('bool': true, 'string': 'string', 'variable': $variable, 'color': rgb(100, 110, 100), 'unit': 12px, 'array': ('arrelem1', 'arrelem2', 'arrelem3'), 'map': ('prop1': 'mappropelem1', 'prop2': 'mappropelem2', 'prop3': 'mappropelem3'));`
		);
	});

	describe('Map keys', function() {
		it('Should be wrapped with quotes by default', function() {
			expect(jsVarsToSassString.convert('quotedKeys', { 'key-with-hyphens': 'value' }, { quotedKeys: true })).toEqual(`$quotedKeys: ('key-with-hyphens': 'value');`);
			expect(jsVarsToSassString.convert('quotedKeys', { '$variable': 'value' })).toEqual(`$quotedKeys: ('$variable': 'value');`);
		});

		it('Should be leaved as is if `options.quotedKeys` is `false`', function() {
			expect(jsVarsToSassString.convert('quotedKeys', { 'key-with-hyphens': 'value' }, { quotedKeys: false })).toEqual(`$quotedKeys: (key-with-hyphens: 'value');`);
			expect(jsVarsToSassString.convert('quotedKeys', { '$variable': 'value' }, { quotedKeys: false })).toEqual(`$quotedKeys: ($variable: 'value');`);
		});
	});

	it('Should properly handle .sass syntax', function() {
		// Inline setting, should not save setting to the instance's state
		expect(jsVarsToSassString.convert('name', 'value', { syntax: 'sass' })).toEqual(`$name: 'value'`);
		// Inline setting with three parameters
		expect(
			jsVarsToSassString.convert(
				'map',
				{
					bool: true,
					string: 'string',
					variable: '$variable',
					color: 'rgb(100, 110, 100)',
					unit: '12px',
					array: ['arrelem1', 'arrelem2', 'arrelem3'],
					map: { prop1: 'mappropelem1', prop2: 'mappropelem2', prop3: 'mappropelem3' }
				},
				{ syntax: 'scss' }
			)
		).toEqual(
			`$map: ('bool': true, 'string': 'string', 'variable': $variable, 'color': rgb(100, 110, 100), 'unit': 12px, 'array': ('arrelem1', 'arrelem2', 'arrelem3'), 'map': ('prop1': 'mappropelem1', 'prop2': 'mappropelem2', 'prop3': 'mappropelem3'));`
		);
		expect(jsVarsToSassString.convert('name', 'value')).toEqual(`$name: 'value';`);

		// Global setting, should save setting to the instance's state
		jsVarsToSassString.setOption('syntax', 'sass');
		expect(jsVarsToSassString.convert('name', 'value')).toEqual(`$name: 'value'`);
		expect(
			jsVarsToSassString.convert({
				number: 0.454,
				map: {
					bool: true,
					string: 'string',
					variable: '$variable',
					color: 'rgb(100, 110, 100)',
					unit: '12px',
					array: ['arrelem1', 'arrelem2', 'arrelem3'],
					map: { prop1: 'mappropelem1', prop2: 'mappropelem2', prop3: 'mappropelem3' }
				}
			})
		).toEqual(
			`$number: 0.454\n$map: ('bool': true, 'string': 'string', 'variable': $variable, 'color': rgb(100, 110, 100), 'unit': 12px, 'array': ('arrelem1', 'arrelem2', 'arrelem3'), 'map': ('prop1': 'mappropelem1', 'prop2': 'mappropelem2', 'prop3': 'mappropelem3'))`
		);
		jsVarsToSassString.setOption('syntax', 'scss');
	});

	it('`_hasUnit` should detect numbers with units', function() {
		expect(jsVarsToSassString._hasUnit('12px')).toEqual({ value: 12, unit: 'px' });
		expect(jsVarsToSassString._hasUnit('12px_')).toEqual(false);
		expect(jsVarsToSassString._hasUnit('12')).toEqual(false);
		expect(jsVarsToSassString._hasUnit(12)).toEqual(false);
	});

	it('`_isColor` should detect whether the value is a color', function() {
		expect(jsVarsToSassString._isColor('000000')).toEqual(false);
		expect(jsVarsToSassString._isColor('black')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
		expect(jsVarsToSassString._isColor('#000000')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
		expect(jsVarsToSassString._isColor('rgba(0, 0, 0, 1)')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
		expect(jsVarsToSassString._isColor('rgba(0, 0, 0, 0.5)')).toEqual({ r: 0, g: 0, b: 0, a: 0.5 });
	});
});
