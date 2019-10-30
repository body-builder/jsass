const JSVarsToSass = require('../src/JSVarsToSass');

describe_implementation('jsVarsToSass', function(sass) {
	const jsVarsToSass = new JSVarsToSass({ implementation: sass });

	describe('If the converter cannot handle the given variable type', function() {
		const jsVarsToSass_strict = new JSVarsToSass({ strict: true, implementation: sass });
		const jsVarsToSass_loose = new JSVarsToSass({ strict: false, implementation: sass });

		it('Should throw error in strict mode', function() {
			expect(() => jsVarsToSass_strict.convert(new RegExp(/.*/))).toThrow(new Error('JSVarsToSass - Unexpected variable type `regexp`'));
			expect(() => jsVarsToSass_strict.convert(() => {})).toThrow(new Error('JSVarsToSass - Unexpected variable type `function`'));
		});

		it('Should return the type of the variable in loose mode', function() {
			expect(jsVarsToSass_loose.convert(new RegExp(/.*/))).toEqual(new sass.types.String('[JS Regexp]'));
			expect(jsVarsToSass_loose.convert(() => {})).toEqual(new sass.types.String('[JS Function]'));
		});
	});

	it('Should return the values in the equivalent Sass type', function() {
		// Null
		expect(jsVarsToSass.convert(null)).toEqual(sass.types.Null.NULL);

		// Boolean
		expect(jsVarsToSass.convert(true)).toEqual(sass.types.Boolean.TRUE);
		expect(jsVarsToSass.convert(false)).toEqual(sass.types.Boolean.FALSE);

		// String
		expect(jsVarsToSass.convert('string')).toEqual(new sass.types.String('string'));
		expect(jsVarsToSass.convert('1')).toEqual(new sass.types.String('1'));

		// Number
		expect(jsVarsToSass.convert(1)).toEqual(new sass.types.Number(1));
		expect(jsVarsToSass.convert('50%')).toEqual(new sass.types.Number(50, '%'));

		// Color
		expect(jsVarsToSass.convert('#000000')).toEqual(new sass.types.Color(0, 0, 0, 1));

		// List
		const sassList = new sass.types.List(1);
		sassList.setValue(0, new sass.types.String('string'));
		expect(jsVarsToSass.convert(['string'])).toEqual(sassList);

		// Map
		const sassMap = new sass.types.Map(1);
		sassMap.setKey(0, new sass.types.String('a'));
		sassMap.setValue(0, new sass.types.String('a'));
		expect(jsVarsToSass.convert({ a: 'a' })).toEqual(sassMap);
	});

	it('Should return the same value', function() {
		// Null
		expect(jsVarsToSass.convert(null)).toEqual(sass.types.Null.NULL);

		// Boolean
		expect(jsVarsToSass.convert(true).getValue()).toEqual(sass.types.Boolean.TRUE.getValue());
		expect(jsVarsToSass.convert(false).getValue()).toEqual(sass.types.Boolean.FALSE.getValue());

		// String
		expect(jsVarsToSass.convert('string').getValue()).toEqual(new sass.types.String('string').getValue());
		expect(jsVarsToSass.convert('1').getValue()).toEqual(new sass.types.String('1').getValue());

		// Number
		expect(jsVarsToSass.convert(1).getValue()).toEqual(new sass.types.Number(1).getValue());
		expect(jsVarsToSass.convert(0).getValue()).toEqual(new sass.types.Number(0).getValue());
		expect(jsVarsToSass.convert(-1).getValue()).toEqual(new sass.types.Number(-1).getValue());
		expect(jsVarsToSass.convert('0px').getValue()).toEqual(new sass.types.Number(0, 'px').getValue());
		expect(jsVarsToSass.convert('0px').getUnit()).toEqual(new sass.types.Number(0, 'px').getUnit());
		expect(jsVarsToSass.convert('10em').getUnit()).toEqual(new sass.types.Number(10, 'em').getUnit());
		expect(jsVarsToSass.convert('50%').getUnit()).toEqual(new sass.types.Number(50, '%').getUnit());

		// Color
		expect(jsVarsToSass.convert('#000000').getR()).toEqual(new sass.types.Color(0, 0, 0, 1).getR());
		expect(jsVarsToSass.convert('#000000').getG()).toEqual(new sass.types.Color(0, 0, 0, 1).getG());
		expect(jsVarsToSass.convert('#000000').getB()).toEqual(new sass.types.Color(0, 0, 0, 1).getB());
		expect(jsVarsToSass.convert('#000000').getA()).toEqual(new sass.types.Color(0, 0, 0, 1).getA());
		expect(jsVarsToSass.convert('rgba(0, 0, 0, 0.5)').getA()).toEqual(new sass.types.Color(0, 0, 0, 0.5).getA());
	});

	it('Should handle Arrays correctly', function() {
		const array = [null, true, false, 'string', '1', 1, 0, -1, '0px', '10em', '50%'];
		const list = jsVarsToSass.convert(array);

		expect(list.getLength()).toEqual(array.length);

		expect(list.getValue(0)).toEqual(sass.types.Null.NULL);

		expect(list.getValue(1).getValue()).toEqual(sass.types.Boolean.TRUE.getValue());
		expect(list.getValue(2).getValue()).toEqual(sass.types.Boolean.FALSE.getValue());

		expect(list.getValue(3).getValue()).toEqual(new sass.types.String('string').getValue());
		expect(list.getValue(4).getValue()).toEqual(new sass.types.String('1').getValue());

		expect(list.getValue(5).getValue()).toEqual(new sass.types.Number(1).getValue());
		expect(list.getValue(6).getValue()).toEqual(new sass.types.Number(0).getValue());
		expect(list.getValue(7).getValue()).toEqual(new sass.types.Number(-1).getValue());
		expect(list.getValue(8).getValue()).toEqual(new sass.types.Number(0, 'px').getValue());
		expect(list.getValue(8).getUnit()).toEqual(new sass.types.Number(0, 'px').getUnit());
		expect(list.getValue(9).getUnit()).toEqual(new sass.types.Number(10, 'em').getUnit());
		expect(list.getValue(10).getUnit()).toEqual(new sass.types.Number(50, '%').getUnit());
	});

	it('Should handle Objects correctly', function() {
		const object = {
			null: null,
			true: true,
			false: false,
			string: 'string',
			string_number: '1',
			positive: 1,
			zero: 0,
			negative: -1,
			zero_px: '0px',
			ten_em: '10em',
			fifty_percent: '50%',
			color_without_alpha: '#000000',
			color_with_alpha: 'rgb(100, 110, 100, 0.5)',
			array: ['arrelem1', 'arrelem2', 'arrelem3'],
			map: { prop1: 'mappropelem1', prop2: 'mappropelem2', prop3: 'mappropelem3' }
			// variable: '$variable', TODO?
		};
		const map = jsVarsToSass.convert(object);

		expect(map.getLength()).toEqual(Object.keys(object).length);

		// Null
		expect(map.getKey(0).getValue()).toEqual('null');
		expect(map.getValue(0)).toEqual(sass.types.Null.NULL);

		// Boolean
		expect(map.getKey(1).getValue()).toEqual('true');
		expect(map.getValue(1).getValue()).toEqual(sass.types.Boolean.TRUE.getValue());
		expect(map.getKey(2).getValue()).toEqual('false');
		expect(map.getValue(2).getValue()).toEqual(sass.types.Boolean.FALSE.getValue());

		// String
		expect(map.getKey(3).getValue()).toEqual('string');
		expect(map.getValue(3).getValue()).toEqual(new sass.types.String('string').getValue());
		expect(map.getKey(4).getValue()).toEqual('string_number');
		expect(map.getValue(4).getValue()).toEqual(new sass.types.String('1').getValue());

		// Number
		expect(map.getKey(5).getValue()).toEqual('positive');
		expect(map.getValue(5).getValue()).toEqual(new sass.types.Number(1).getValue());
		expect(map.getKey(6).getValue()).toEqual('zero');
		expect(map.getValue(6).getValue()).toEqual(new sass.types.Number(0).getValue());
		expect(map.getKey(7).getValue()).toEqual('negative');
		expect(map.getValue(7).getValue()).toEqual(new sass.types.Number(-1).getValue());
		expect(map.getKey(8).getValue()).toEqual('zero_px');
		expect(map.getValue(8).getValue()).toEqual(new sass.types.Number(0, 'px').getValue());
		expect(map.getValue(8).getUnit()).toEqual(new sass.types.Number(0, 'px').getUnit());
		expect(map.getKey(9).getValue()).toEqual('ten_em');
		expect(map.getValue(9).getUnit()).toEqual(new sass.types.Number(10, 'em').getUnit());
		expect(map.getKey(10).getValue()).toEqual('fifty_percent');
		expect(map.getValue(10).getUnit()).toEqual(new sass.types.Number(50, '%').getUnit());

		// Color
		expect(map.getKey(11).getValue()).toEqual('color_without_alpha');
		expect(map.getValue(11).getR()).toEqual(new sass.types.Color(0, 0, 0, 1).getR());
		expect(map.getValue(11).getG()).toEqual(new sass.types.Color(0, 0, 0, 1).getG());
		expect(map.getValue(11).getB()).toEqual(new sass.types.Color(0, 0, 0, 1).getB());
		expect(map.getValue(11).getA()).toEqual(new sass.types.Color(0, 0, 0, 1).getA());
		expect(map.getKey(12).getValue()).toEqual('color_with_alpha');
		expect(map.getValue(12).getR()).toEqual(new sass.types.Color(100, 110, 100, 0.5).getR());
		expect(map.getValue(12).getG()).toEqual(new sass.types.Color(100, 110, 100, 0.5).getG());
		expect(map.getValue(12).getB()).toEqual(new sass.types.Color(100, 110, 100, 0.5).getB());
		expect(map.getValue(12).getA()).toEqual(new sass.types.Color(100, 110, 100, 0.5).getA());

		// List
		expect(map.getKey(13).getValue()).toEqual('array');
		expect(map.getValue(13).getLength()).toEqual(3);
		expect(map.getValue(13).getValue(0).getValue()).toEqual('arrelem1');

		// Map
		expect(map.getKey(14).getValue()).toEqual('map');
		expect(map.getValue(14).getLength()).toEqual(3);
		expect(map.getValue(14).getValue(0).getValue()).toEqual('mappropelem1');
	});
});
