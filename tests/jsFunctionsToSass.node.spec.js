const kindOf = require('kind-of');
const _ = require('lodash');
const util = require('util');

const Deferred = require('./helpers/Deferred');
const sync_test = require('./assets/jsFunctionsToSass').sync;
const async_test = require('./assets/jsFunctionsToSass').async;
const async_es6_test = require('./assets/jsFunctionsToSass').async_es6;

const JSFunctionsToSass = require('../src/JSFunctionsToSass');

describe_implementation('jsFunctionsToSass', function(sass) {
	const promisified = {
		sass: {
			render: util.promisify(sass.render)
		}
	};
	const jsFunctionsToSass = new JSFunctionsToSass({ implementation: sass });

	it('Should throw error if calling with wrong arguments', function() {
		expect(() => jsFunctionsToSass._createSassParameterBlock()).toThrow(new Error('JSFunctionsToSass - pass the Sass function signature to _createSassParameterBlock!'));
		expect(() => jsFunctionsToSass._wrapFunction('sass-fn($arg)')).toThrow(new Error('JSFunctionsToSass - pass a function to wrapFunction!'));
		expect(() => jsFunctionsToSass._wrapObject()).toThrow(new Error('JSFunctionsToSass - pass an object in the following format:\n{\n  \'sass-fn-name($arg1: 0, $arg2: 6)\': function(arg1, arg2) {\n    ...\n  }\n}'));
		expect(() => jsFunctionsToSass.convert()).toThrow(new Error('JSFunctionsToSass - pass an object in the following format:\n{\n  \'sass-fn-name($arg1: 0, $arg2: 6)\': function(arg1, arg2) {\n    ...\n  }\n}'));
		expect(() => jsFunctionsToSass.convert({ 'sass-fn($arg)': null })).toThrow(new Error('JSFunctionsToSass - pass a function to wrapObject!'));
	});

	it('Should throw error if the `done()` function is not available in case of an async call', function() {
		expect(() => jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => Promise.resolve(), [new sass.types.String('a'), new sass.types.String('b'), new sass.types.String('c')])).toThrow(new Error('JSFunctionsToSass - no callback provided from Sass!'));
	});

	it('Should throw error if the converter cannot handle the given variable type', function() {
		expect(() => jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => {}, ['string', () => 'done'])).toThrow(new Error(`Unsupported Sass constructor 'String'`));
		expect(() => jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => {}, [2, () => 'done'])).toThrow(new Error(`Unsupported Sass constructor 'Number'`));
	});

	it('Should return the values in the equivalent Sass type', function() {
		// Null
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => null)).toEqual(sass.types.Null.NULL);

		// Boolean
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => true)).toEqual(sass.types.Boolean.TRUE);
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => false)).toEqual(sass.types.Boolean.FALSE);

		// Error (note that we cannot compare their message)
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => { throw new Error('Some strange error happened') })).toEqual(new sass.types.Error('Some strange error happened'));

		// String
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => 'string')).toEqual(new sass.types.String('string'));
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => '1')).toEqual(new sass.types.String('1'));

		// Number
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => 1)).toEqual(new sass.types.Number(1));
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => '50%')).toEqual(new sass.types.Number(50, '%'));

		// Color
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => '#000000')).toEqual(new sass.types.Color(0, 0, 0, 1));

		// List
		const sassList = new sass.types.List(1);
		sassList.setValue(0, new sass.types.String('string'));
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => ['string'])).toEqual(sassList);

		// Map
		const sassMap = new sass.types.Map(1);
		sassMap.setKey(0, new sass.types.String('a'));
		sassMap.setValue(0, new sass.types.String('a'));
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => ({ a: 'a' }))).toEqual(sassMap);
	});

	it('Should return the same value', function() {
		// Null
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => null)).toEqual(sass.types.Null.NULL);

		// Boolean
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => true).getValue()).toEqual(sass.types.Boolean.TRUE.getValue());
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => false).getValue()).toEqual(sass.types.Boolean.FALSE.getValue());

		// Error (note that we cannot compare their message)
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => { throw new Error('Some strange error happened') })).toEqual(new sass.types.Error('Some strange error happened'));

		// String
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => 'string').getValue()).toEqual(new sass.types.String('string').getValue());
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => '1').getValue()).toEqual(new sass.types.String('1').getValue());

		// Number
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => 1).getValue()).toEqual(new sass.types.Number(1).getValue());
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => 0).getValue()).toEqual(new sass.types.Number(0).getValue());
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => -1).getValue()).toEqual(new sass.types.Number(-1).getValue());
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => '0px').getValue()).toEqual(new sass.types.Number(0, 'px').getValue());
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => '0px').getUnit()).toEqual(new sass.types.Number(0, 'px').getUnit());
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => '10em').getUnit()).toEqual(new sass.types.Number(10, 'em').getUnit());
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => '50%').getUnit()).toEqual(new sass.types.Number(50, '%').getUnit());

		// Color
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => '#000000').getR()).toEqual(new sass.types.Color(0, 0, 0, 1).getR());
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => '#000000').getG()).toEqual(new sass.types.Color(0, 0, 0, 1).getG());
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => '#000000').getB()).toEqual(new sass.types.Color(0, 0, 0, 1).getB());
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => '#000000').getA()).toEqual(new sass.types.Color(0, 0, 0, 1).getA());
		expect(jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => 'rgba(0, 0, 0, 0.5)').getA()).toEqual(new sass.types.Color(0, 0, 0, 0.5).getA());
	});

	it('Should handle Arrays correctly', function() {
		const array = [null, true, false, 'string', '1', 1, 0, -1, '0px', '10em', '50%'];
		const list = jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => array);

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
			'rgb(255, 255, 255)': '#ffffff', // Key is SassColor in Sass, but should be String in JS
			black: 'rgb(0, 0, 0, 1)', // Key is SassColor in Sass, but should be String in JS
			list: ['listelem1', 'listelem2', 'listelem3'],
			map: { prop1: 'mappropelem1', prop2: 'mappropelem2', prop3: 'mappropelem3' }
			// variable: '$variable', TODO?
		};
		const map = jsFunctionsToSass._wrapFunction('sass-fn($arg)', () => object);

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

		// Color (the map key is also a color)
		expect(map.getKey(13).getR()).toEqual(new sass.types.Color(255, 255, 255, 1).getR());
		expect(map.getKey(13).getG()).toEqual(new sass.types.Color(255, 255, 255, 1).getG());
		expect(map.getKey(13).getB()).toEqual(new sass.types.Color(255, 255, 255, 1).getB());
		expect(map.getKey(13).getA()).toEqual(new sass.types.Color(255, 255, 255, 1).getA());
		expect(map.getValue(13).getR()).toEqual(new sass.types.Color(255, 255, 255, 1).getR());
		expect(map.getValue(13).getG()).toEqual(new sass.types.Color(255, 255, 255, 1).getG());
		expect(map.getValue(13).getB()).toEqual(new sass.types.Color(255, 255, 255, 1).getB());
		expect(map.getValue(13).getA()).toEqual(new sass.types.Color(255, 255, 255, 1).getA());
		expect(map.getKey(14).getR()).toEqual(new sass.types.Color(0, 0, 0, 1).getR());
		expect(map.getKey(14).getG()).toEqual(new sass.types.Color(0, 0, 0, 1).getG());
		expect(map.getKey(14).getB()).toEqual(new sass.types.Color(0, 0, 0, 1).getB());
		expect(map.getKey(14).getA()).toEqual(new sass.types.Color(0, 0, 0, 1).getA());
		expect(map.getValue(14).getR()).toEqual(new sass.types.Color(0, 0, 0, 1).getR());
		expect(map.getValue(14).getG()).toEqual(new sass.types.Color(0, 0, 0, 1).getG());
		expect(map.getValue(14).getB()).toEqual(new sass.types.Color(0, 0, 0, 1).getB());
		expect(map.getValue(14).getA()).toEqual(new sass.types.Color(0, 0, 0, 1).getA());

		// List
		expect(map.getKey(15).getValue()).toEqual('list');
		expect(map.getValue(15).getLength()).toEqual(3);
		expect(map.getValue(15).getValue(0).getValue()).toEqual('listelem1');

		// Map
		expect(map.getKey(16).getValue()).toEqual('map');
		expect(map.getValue(16).getLength()).toEqual(3);
		expect(map.getValue(16).getValue(0).getValue()).toEqual('mappropelem1');
	});

	it('Should handle synchronous functions', function() {
		const value = jsFunctionsToSass._wrapFunction('sass-fn($arg)', sync_test, [new sass.types.String('sync'), new sass.types.Number(2), () => 'done']);

		expect(value.getValue()).toEqual(new sass.types.String('sync sync').getValue());
	});

	describe('Should handle asynchronous functions', function() {
		it('Returning promise', async function() {
			// Mocking Sass's `done()` with a promise
			const done = new Deferred();

			jsFunctionsToSass._wrapFunction('sass-fn($arg)', async_test, [new sass.types.String('async'), new sass.types.Number(3), done.resolve]);

			const value = await done;

			expect(value.getValue()).toEqual(new sass.types.String('async async async').getValue());
		});

		it('Async function', async function() {
			// Mocking Sass's `done()` with a promise
			const done = new Deferred();

			jsFunctionsToSass._wrapFunction('sass-fn($arg)', async_es6_test, [new sass.types.String('async'), new sass.types.Number(4), done.resolve]);

			const value = await done;

			expect(value.getValue()).toEqual(new sass.types.String('async async async async').getValue());
		});
	});

	it('Should convert incoming Sass type arguments to JS', function() {
		let spy_arg1, spy_arg2;

		const bla = jsFunctionsToSass._wrapFunction('sass-fn($arg)', (arg1, arg2) => { spy_arg1 = arg1; spy_arg2 = arg2 }, [new sass.types.String('string'), new sass.types.Color(0, 0, 0, 1), () => 'done']);

		expect(spy_arg1).toEqual('string');
		expect(spy_arg2).toEqual('#000000');
	});

	it('Should handle Object of Functions', function() {
		const wrappedObject = jsFunctionsToSass.convert({
			'sync_test($str, $number)': sync_test,
			'async_test($str, $number)': async_test
		});

		expect(Object.keys(wrappedObject)).toContain('sync_test($str, $number)');

		const selectedProp = wrappedObject['sync_test($str, $number)'];

		expect(selectedProp).toEqual(jasmine.any(Function));
		expect(selectedProp(new sass.types.String('async'), new sass.types.Number(3), () => 'done').getValue()).toEqual(new sass.types.String('async async async').getValue());
	});

	describe('Should handle spread parameters correctly', function() {
		let spy_spread_args, spy_spread_string_args, spy_no_spread_args;
		const list = new sass.types.List(2);
		list.setValue(0, new sass.types.String('string'));
		list.setValue(1, new sass.types.Color(0, 0, 0, 1));

		const spread_test = jsFunctionsToSass._wrapFunction('spread_test($arg...)', function () { spy_spread_args = arguments }, [list, () => 'done']);
		const spread_string_test = jsFunctionsToSass._wrapFunction('spread_string_test($arg)', function () { spy_spread_string_args = arguments }, [new sass.types.String('string'), () => 'done']);
		const no_spread_test = jsFunctionsToSass._wrapFunction('no_spread_test($arg)', function () { spy_no_spread_args = arguments }, [list, () => 'done']);

		it('Should spread lists', function(){
			expect(kindOf(spy_spread_args[0])).toEqual('string');
			expect(spy_spread_args[0]).toEqual('string');
			expect(kindOf(spy_spread_args[1])).toEqual('string');
			expect(spy_spread_args[1]).toEqual('#000000');
		});

		it('Shouldn\'t spread other types', function() {
			expect(kindOf(spy_spread_string_args[0])).toEqual('string');
			expect(spy_spread_string_args[0]).toEqual('string');
			expect(kindOf(spy_spread_string_args[1])).toEqual('undefined');
		});

		it('Should spread only if the Sass function signature contains spread parameter', function() {
			expect(kindOf(spy_no_spread_args[0])).toEqual('array');
			expect(kindOf(spy_no_spread_args[0][0])).toEqual('string');
			expect(spy_no_spread_args[0][0]).toEqual('string');
			expect(kindOf(spy_no_spread_args[0][1])).toEqual('string');
			expect(spy_no_spread_args[0][1]).toEqual('#000000');
		});
	});

	describe('Synchronous Sass functions', function() {
		const sassOptions = {
			file: 'tests/assets/test-join.scss',
			functions: jsFunctionsToSass.convert({
				'test-join($str, $number)': sync_test
			}),
			outputStyle: 'expanded'
		};
		const expectedOutput = '.resolved {\n  content: "test test test";\n}';

		it('Should pick the function and use it during build-time in asynchronous rendering mode', async function() {
			const result = await promisified.sass.render(sassOptions);

			expect(result.css.toString().trim()).toEqual(expectedOutput);
		});

		it('Should pick the function and use it during build-time in synchronous rendering mode', function() {
			const result = sass.renderSync(sassOptions);

			expect(result.css.toString().trim()).toEqual(expectedOutput);
		});
	});

	describe('Asynchronous Sass functions', function() {
		const sassOptions = {
			file: 'tests/assets/test-join.scss',
			functions: jsFunctionsToSass.convert({
				'test-join($str, $number)': async_test
			}),
			outputStyle: 'expanded'
		};
		const expectedOutput = '.resolved {\n  content: "test test test";\n}';

		it('Should pick the function and use it during build-time in asynchronous rendering mode', async function() {
			const result = await promisified.sass.render(sassOptions);

			expect(result.css.toString().trim()).toEqual(expectedOutput);
		});

		it('Should throw error in synchronous rendering mode', function() {
			expect(() => sass.renderSync(sassOptions)).toThrowError();
		});
	});

	describe('Simpler syntax for Sass function signature', function() {
		it('Should resolve the parameter name correctly', async function() {
			const wrappedObject = jsFunctionsToSass.convert({
				a_b_c: (a, b, c) => JSON.stringify({ a, b, c })
			});

			expect(Object.keys(wrappedObject)).toContain('a_b_c($a, $b, $c)');

			// ordinal arguments
			const result = await promisified.sass.render({
				data: '.test { content: "#{a_b_c(1, 2, 3)}"; }',
				functions: wrappedObject,
				outputStyle: 'expanded'
			});

			expect(result.css.toString().trim()).toEqual('.test {\n  content: \'{"a":1,"b":2,"c":3}\';\n}');

			// named arguments
			const result2 = await promisified.sass.render({
				data: '.test { content: "#{a_b_c($c: 1, $a: 2, $b: 3)}"; }',
				functions: wrappedObject,
				outputStyle: 'expanded'
			});

			expect(result2.css.toString().trim()).toEqual('.test {\n  content: \'{"a":2,"b":3,"c":1}\';\n}');

			// ordinal and named arguments mixed
			const result3 = await promisified.sass.render({
				data: '.test { content: "#{a_b_c(1, $c: 2, $b: 3)}"; }',
				functions: wrappedObject,
				outputStyle: 'expanded'
			});

			expect(result3.css.toString().trim()).toEqual('.test {\n  content: \'{"a":1,"b":3,"c":2}\';\n}');
		});

		it('Should add a single _spread_ Sass parameter if no parameters found in the JS function', async function() {
			const wrappedObject = jsFunctionsToSass.convert({
				spread_arguments: function() {
					return JSON.stringify([...arguments]);
				}
			});

			expect(Object.keys(wrappedObject)).toContain('spread_arguments($arguments...)');

			const result = await promisified.sass.render({
				data: '.test { content: "#{spread_arguments(1, 2, 3)}"; }',
				functions: wrappedObject,
				outputStyle: 'expanded'
			});

			expect(result.css.toString().trim()).toEqual('.test {\n  content: "[1,2,3]";\n}');
		});

		it('Should resolve the name and the parameters only from a function reference', function() {
			const function_reference = (a, b, c) => {},
				function_reference_no_arguments = () => {};

			const wrappedObject = jsFunctionsToSass.convert({
				function_reference,
				function_reference_no_arguments
			});

			expect(Object.keys(wrappedObject)).toContain('function_reference($a, $b, $c)');
			expect(Object.keys(wrappedObject)).toContain('function_reference_no_arguments($arguments...)');
		});

		it('Should keep the already defined parameters untouched', function() {
			const wrappedObject = jsFunctionsToSass.convert({
				'has_arguments($str, $number)': (a, b, c) => {},
				'no_arguments()': (a, b, c) => {},
				'no_arguments_spread()': () => {}
			});

			expect(Object.keys(wrappedObject)).toContain('has_arguments($str, $number)');
			expect(Object.keys(wrappedObject)).toContain('no_arguments()');
			expect(Object.keys(wrappedObject)).toContain('no_arguments_spread()');
		});
	});
});
