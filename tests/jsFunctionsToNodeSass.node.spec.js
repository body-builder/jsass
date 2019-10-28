const kindOf = require('kind-of');
const _ = require('lodash');
const sass = require('node-sass');
const util = require('util');

const promisified = {
	sass: {
		render: util.promisify(sass.render)
	}
};

const Deferred = require('./helpers/Deferred');
const sync_test = require('./assets/jsFunctionsToNodeSass').sync;
const async_test = require('./assets/jsFunctionsToNodeSass').async;
const async_es6_test = require('./assets/jsFunctionsToNodeSass').async_es6;

const JSFunctionsToNodeSass = require('../src/JSFunctionsToNodeSass');
const jsFunctionsToNodeSass = new JSFunctionsToNodeSass({ implementation: sass });

describe('jsFunctionsToNodeSass', function() {
	it('Should throw error if calling with wrong arguments', function() {
		expect(() => jsFunctionsToNodeSass._wrapFunction()).toThrow(new Error('JSFunctionsToSass - pass the Sass function declaration to wrapFunction!'));
		expect(() => jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)')).toThrow(new Error('JSFunctionsToSass - pass a function to wrapFunction!'));
		expect(() => jsFunctionsToNodeSass._wrapObject()).toThrow(new Error('JSFunctionsToSass - pass an object in the following format:\n{\n  \'sass-fn-name($arg1: 0, $arg2: 6)\': function(arg1, arg2) {\n    ...\n  }\n}'));
		expect(() => jsFunctionsToNodeSass.convert()).toThrow(new Error('JSFunctionsToSass - pass an object in the following format:\n{\n  \'sass-fn-name($arg1: 0, $arg2: 6)\': function(arg1, arg2) {\n    ...\n  }\n}'));
		expect(() => jsFunctionsToNodeSass.convert({ 'sass-fn($arg)': null })).toThrow(new Error('JSFunctionsToSass - pass a function to wrapObject!'));
	});

	it('Should throw error if the `done()` function is not available in case of an async call', function() {
		expect(() => jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => Promise.resolve(), [sass.types.String('a'), sass.types.String('b'), sass.types.String('c')])).toThrow(new Error('JSFunctionsToSass - no callback provided from node-sass!'));
	});

	it('Should throw error if the converter cannot handle the given variable type', function() {
		expect(() => jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => {}, ['string', () => 'done'])).toThrow(new Error('NodeSassVarsToJs - Unexpected node-sass variable type `string`'));
		expect(() => jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => {}, [2, () => 'done'])).toThrow(new Error('NodeSassVarsToJs - Unexpected node-sass variable type `number`'));
	});

	it('Should return the values in the equivalent Sass type', function() {
		// Null
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => null)).toEqual(sass.types.Null.NULL);

		// Boolean
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => true)).toEqual(sass.types.Boolean.TRUE);
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => false)).toEqual(sass.types.Boolean.FALSE);

		// Error (note that we cannot compare their message)
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => { throw new Error('Some strange error happened') })).toEqual(sass.types.Error('Some strange error happened'));

		// String
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => 'string')).toEqual(sass.types.String('string'));
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => '1')).toEqual(sass.types.String('1'));

		// Number
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => 1)).toEqual(sass.types.Number(1));
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => '50%')).toEqual(sass.types.Number(50, '%'));

		// Color
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => '#000000')).toEqual(sass.types.Color(0, 0, 0, 1));

		// List
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => ['string'])).toEqual(sass.types.List(1));

		// Map
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => ({ a: 'a' }))).toEqual(sass.types.Map(1));
	});

	it('Should return the same value', function() {
		// Null
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => null)).toEqual(sass.types.Null.NULL);

		// Boolean
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => true).getValue()).toEqual(sass.types.Boolean.TRUE.getValue());
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => false).getValue()).toEqual(sass.types.Boolean.FALSE.getValue());

		// Error (note that we cannot compare their message)
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => { throw new Error('Some strange error happened') })).toEqual(sass.types.Error('Some strange error happened'));

		// String
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => 'string').getValue()).toEqual(sass.types.String('string').getValue());
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => '1').getValue()).toEqual(sass.types.String('1').getValue());

		// Number
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => 1).getValue()).toEqual(sass.types.Number(1).getValue());
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => 0).getValue()).toEqual(sass.types.Number(0).getValue());
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => -1).getValue()).toEqual(sass.types.Number(-1).getValue());
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => '0px').getValue()).toEqual(sass.types.Number(0, 'px').getValue());
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => '0px').getUnit()).toEqual(sass.types.Number(0, 'px').getUnit());
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => '10em').getUnit()).toEqual(sass.types.Number(10, 'em').getUnit());
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => '50%').getUnit()).toEqual(sass.types.Number(50, '%').getUnit());

		// Color
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => '#000000').getR()).toEqual(sass.types.Color(0, 0, 0, 1).getR());
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => '#000000').getG()).toEqual(sass.types.Color(0, 0, 0, 1).getG());
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => '#000000').getB()).toEqual(sass.types.Color(0, 0, 0, 1).getB());
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => '#000000').getA()).toEqual(sass.types.Color(0, 0, 0, 1).getA());
		expect(jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => 'rgba(0, 0, 0, 0.5)').getA()).toEqual(sass.types.Color(0, 0, 0, 0.5).getA());
	});

	it('Should handle Arrays correctly', function() {
		const array = [null, true, false, 'string', '1', 1, 0, -1, '0px', '10em', '50%'];
		const list = jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => array);

		expect(list.getLength()).toEqual(array.length);

		expect(list.getValue(0)).toEqual(sass.types.Null.NULL);

		expect(list.getValue(1).getValue()).toEqual(sass.types.Boolean(true).getValue());
		expect(list.getValue(2).getValue()).toEqual(sass.types.Boolean(false).getValue());

		expect(list.getValue(3).getValue()).toEqual(sass.types.String('string').getValue());
		expect(list.getValue(4).getValue()).toEqual(sass.types.String('1').getValue());

		expect(list.getValue(5).getValue()).toEqual(sass.types.Number(1).getValue());
		expect(list.getValue(6).getValue()).toEqual(sass.types.Number(0).getValue());
		expect(list.getValue(7).getValue()).toEqual(sass.types.Number(-1).getValue());
		expect(list.getValue(8).getValue()).toEqual(sass.types.Number(0, 'px').getValue());
		expect(list.getValue(8).getUnit()).toEqual(sass.types.Number(0, 'px').getUnit());
		expect(list.getValue(9).getUnit()).toEqual(sass.types.Number(10, 'em').getUnit());
		expect(list.getValue(10).getUnit()).toEqual(sass.types.Number(50, '%').getUnit());
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
			list: ['listelem1', 'listelem2', 'listelem3'],
			map: { prop1: 'mappropelem1', prop2: 'mappropelem2', prop3: 'mappropelem3' }
			// variable: '$variable', TODO?
		};
		const map = jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', () => object);

		expect(map.getLength()).toEqual(Object.keys(object).length);

		// Null
		expect(map.getKey(0).getValue()).toEqual('null');
		expect(map.getValue(0)).toEqual(sass.types.Null.NULL);

		// Boolean
		expect(map.getKey(1).getValue()).toEqual('true');
		expect(map.getValue(1).getValue()).toEqual(sass.types.Boolean(true).getValue());
		expect(map.getKey(2).getValue()).toEqual('false');
		expect(map.getValue(2).getValue()).toEqual(sass.types.Boolean(false).getValue());

		// String
		expect(map.getKey(3).getValue()).toEqual('string');
		expect(map.getValue(3).getValue()).toEqual(sass.types.String('string').getValue());
		expect(map.getKey(4).getValue()).toEqual('string_number');
		expect(map.getValue(4).getValue()).toEqual(sass.types.String('1').getValue());

		// Number
		expect(map.getKey(5).getValue()).toEqual('positive');
		expect(map.getValue(5).getValue()).toEqual(sass.types.Number(1).getValue());
		expect(map.getKey(6).getValue()).toEqual('zero');
		expect(map.getValue(6).getValue()).toEqual(sass.types.Number(0).getValue());
		expect(map.getKey(7).getValue()).toEqual('negative');
		expect(map.getValue(7).getValue()).toEqual(sass.types.Number(-1).getValue());
		expect(map.getKey(8).getValue()).toEqual('zero_px');
		expect(map.getValue(8).getValue()).toEqual(sass.types.Number(0, 'px').getValue());
		expect(map.getValue(8).getUnit()).toEqual(sass.types.Number(0, 'px').getUnit());
		expect(map.getKey(9).getValue()).toEqual('ten_em');
		expect(map.getValue(9).getUnit()).toEqual(sass.types.Number(10, 'em').getUnit());
		expect(map.getKey(10).getValue()).toEqual('fifty_percent');
		expect(map.getValue(10).getUnit()).toEqual(sass.types.Number(50, '%').getUnit());

		// Color
		expect(map.getKey(11).getValue()).toEqual('color_without_alpha');
		expect(map.getValue(11).getR()).toEqual(sass.types.Color(0, 0, 0, 1).getR());
		expect(map.getValue(11).getG()).toEqual(sass.types.Color(0, 0, 0, 1).getG());
		expect(map.getValue(11).getB()).toEqual(sass.types.Color(0, 0, 0, 1).getB());
		expect(map.getValue(11).getA()).toEqual(sass.types.Color(0, 0, 0, 1).getA());
		expect(map.getKey(12).getValue()).toEqual('color_with_alpha');
		expect(map.getValue(12).getR()).toEqual(sass.types.Color(100, 110, 100, 0.5).getR());
		expect(map.getValue(12).getG()).toEqual(sass.types.Color(100, 110, 100, 0.5).getG());
		expect(map.getValue(12).getB()).toEqual(sass.types.Color(100, 110, 100, 0.5).getB());
		expect(map.getValue(12).getA()).toEqual(sass.types.Color(100, 110, 100, 0.5).getA());

		// List
		expect(map.getKey(13).getValue()).toEqual('list');
		expect(map.getValue(13).getLength()).toEqual(3);
		expect(map.getValue(13).getValue(0).getValue()).toEqual('listelem1');

		// Map
		expect(map.getKey(14).getValue()).toEqual('map');
		expect(map.getValue(14).getLength()).toEqual(3);
		expect(map.getValue(14).getValue(0).getValue()).toEqual('mappropelem1');
	});

	it('Should handle synchronous functions', function() {
		const value = jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', sync_test, [sass.types.String('sync'), sass.types.Number(2), () => 'done']);

		expect(value.getValue()).toEqual(sass.types.String('sync sync').getValue());
	});

	describe('Should handle asynchronous functions', function() {
		it('Returning promise', async function() {
			// Mocking node-sass's `done()` with a promise
			const done = new Deferred();

			jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', async_test, [sass.types.String('async'), sass.types.Number(3), done.resolve]);

			const value = await done;

			expect(value.getValue()).toEqual(sass.types.String('async async async').getValue());
		});

		it('Async function', async function() {
			// Mocking node-sass's `done()` with a promise
			const done = new Deferred();

			jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', async_es6_test, [sass.types.String('async'), sass.types.Number(4), done.resolve]);

			const value = await done;

			expect(value.getValue()).toEqual(sass.types.String('async async async async').getValue());
		});
	});

	it('Should convert incoming node-sass type arguments to JS', function() {
		let spy_arg1, spy_arg2;

		const bla = jsFunctionsToNodeSass._wrapFunction('sass-fn($arg)', (arg1, arg2) => { spy_arg1 = arg1; spy_arg2 = arg2 }, [sass.types.String('string'), sass.types.Color(0, 0, 0, 1), () => 'done']);

		expect(spy_arg1).toEqual('string');
		expect(spy_arg2).toEqual('#000000');
	});

	it('Should handle Object of Functions', function() {
		const wrappedObject = jsFunctionsToNodeSass.convert({
			'sync_test($str, $number)': sync_test,
			'async_test($str, $number)': async_test
		});

		expect(Object.keys(wrappedObject)).toContain('sync_test($str, $number)');

		const selectedProp = wrappedObject['sync_test($str, $number)'];

		expect(selectedProp).toEqual(jasmine.any(Function));
		expect(selectedProp(sass.types.String('async'), sass.types.Number(3), () => 'done').getValue()).toEqual(sass.types.String('async async async').getValue());
	});

	describe('Should handle spread arguments correctly', function() {
		let spy_spread_args, spy_spread_string_args, spy_no_spread_args;
		const list = new sass.types.List(2);
		list.setValue(0, sass.types.String('string'));
		list.setValue(1, sass.types.Color(0, 0, 0, 1));

		const spread_test = jsFunctionsToNodeSass._wrapFunction('spread_test($arg...)', function () { spy_spread_args = arguments }, [list, () => 'done']);
		const spread_string_test = jsFunctionsToNodeSass._wrapFunction('spread_string_test($arg)', function () { spy_spread_string_args = arguments }, [sass.types.String('string'), () => 'done']);
		const no_spread_test = jsFunctionsToNodeSass._wrapFunction('no_spread_test($arg)', function () { spy_no_spread_args = arguments }, [list, () => 'done']);

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

		it('Should spread only if the Sass function declaration contains spread argument', function() {
			expect(kindOf(spy_no_spread_args[0])).toEqual('array');
			expect(kindOf(spy_no_spread_args[0][0])).toEqual('string');
			expect(spy_no_spread_args[0][0]).toEqual('string');
			expect(kindOf(spy_no_spread_args[0][1])).toEqual('string');
			expect(spy_no_spread_args[0][1]).toEqual('#000000');
		});
	});

	describe('node-sass', function() {
		it('Should pick the function and use it during build-time', async function() {
			const result = await promisified.sass.render({
				file: 'tests/assets/map-get-super.scss',
				functions: jsFunctionsToNodeSass.convert({
					'map-get-super($object, $string)': _.get
				}),
				outputStyle: 'compact'
			});

			expect(result.css.toString()).toEqual('.resolved { content: jSass; }\n');
		});
	});
});
