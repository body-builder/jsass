const sass = require('sass');

const NodeSassVarsToJs = require('../src/NodeSassVarsToJs');
const nodeSassVarsToJs = new NodeSassVarsToJs();

describe('nodeSassVarsToJs', function() {
	it('Should throw error if the converter cannot handle the given variable type', function() {
		expect(() => nodeSassVarsToJs.convert(new RegExp(/.*/))).toThrow(new Error('NodeSassVarsToJs - Unexpected Sass variable type `regexp`'));
		expect(() => nodeSassVarsToJs.convert(() => {})).toThrow(new Error('NodeSassVarsToJs - Unexpected Sass variable type `function`'));
	});
	it('Should return the values in the equivalent JS type', function() {
		// Null
		expect(nodeSassVarsToJs.convert(sass.types.Null.NULL)).toEqual(null);

		// Boolean
		expect(nodeSassVarsToJs.convert(sass.types.Boolean.TRUE)).toEqual(true);
		expect(nodeSassVarsToJs.convert(sass.types.Boolean.FALSE)).toEqual(false);

		// String
		expect(nodeSassVarsToJs.convert(new sass.types.String('string'))).toEqual('string');
		expect(nodeSassVarsToJs.convert(new sass.types.String('1'))).toEqual('1');

		// Number
		expect(nodeSassVarsToJs.convert(new sass.types.Number(1))).toEqual(1);
		expect(nodeSassVarsToJs.convert(new sass.types.Number(50, '%'))).toEqual('50%');

		// Color
		expect(nodeSassVarsToJs.convert(new sass.types.Color(0, 0, 0, 1))).toEqual('#000000');

		// List
		const list = new sass.types.List(1);
		list.setValue(0, new sass.types.String('string'));

		expect(nodeSassVarsToJs.convert(list)).toEqual(['string']);

		// Map
		const map = new sass.types.Map(1);
		map.setKey(0, new sass.types.String('a'));
		map.setValue(0, new sass.types.String('a'));

		expect(nodeSassVarsToJs.convert(map)).toEqual({ a: 'a' });
	});
	it('Should return the same value', function() {
		// Null
		expect(nodeSassVarsToJs.convert(sass.types.Null.NULL)).toEqual(null);

		// Boolean
		expect(nodeSassVarsToJs.convert(sass.types.Boolean.TRUE)).toEqual(true);
		expect(nodeSassVarsToJs.convert(sass.types.Boolean.FALSE)).toEqual(false);

		// String
		expect(nodeSassVarsToJs.convert(new sass.types.String('string'))).toEqual('string');
		expect(nodeSassVarsToJs.convert(new sass.types.String('1'))).toEqual('1');

		// Number
		expect(nodeSassVarsToJs.convert(new sass.types.Number(1))).toEqual(1);
		expect(nodeSassVarsToJs.convert(new sass.types.Number(0))).toEqual(0);
		expect(nodeSassVarsToJs.convert(new sass.types.Number(-1))).toEqual(-1);
		expect(nodeSassVarsToJs.convert(new sass.types.Number(0, 'px'))).toEqual('0px');
		expect(nodeSassVarsToJs.convert(new sass.types.Number(0, 'px'))).toEqual('0px');
		expect(nodeSassVarsToJs.convert(new sass.types.Number(10, 'em'))).toEqual('10em');
		expect(nodeSassVarsToJs.convert(new sass.types.Number(50, '%'))).toEqual('50%');

		// Color
		expect(nodeSassVarsToJs.convert(new sass.types.Color(0, 0, 0, 1))).toEqual('#000000');
		expect(nodeSassVarsToJs.convert(new sass.types.Color(0, 0, 0, 0.5))).toEqual('rgba(0, 0, 0, 0.5)');
	});

	it('Should handle Arrays correctly', function() {
		const list = new sass.types.List(11);
		list.setValue(0, sass.types.Null.NULL);
		list.setValue(1, sass.types.Boolean.TRUE);
		list.setValue(2, sass.types.Boolean.FALSE);
		list.setValue(3, new sass.types.String('string'));
		list.setValue(4, new sass.types.String('1'));
		list.setValue(5, new sass.types.Number(1));
		list.setValue(6, new sass.types.Number(0));
		list.setValue(7, new sass.types.Number(-1));
		list.setValue(8, new sass.types.Number(0, 'px'));
		list.setValue(9, new sass.types.Number(10, 'em'));
		list.setValue(10, new sass.types.Number(50, '%'));

		const array = nodeSassVarsToJs.convert(list);

		expect(array.length).toEqual(list.getLength());

		expect(array[0]).toEqual(null);

		expect(array[1]).toEqual(true);
		expect(array[2]).toEqual(false);

		expect(array[3]).toEqual('string');
		expect(array[4]).toEqual('1');

		expect(array[5]).toEqual(1);
		expect(array[6]).toEqual(0);
		expect(array[7]).toEqual(-1);
		expect(array[8]).toEqual('0px');
		expect(array[9]).toEqual('10em');
		expect(array[10]).toEqual('50%');
	});

	it('Should handle Objects correctly', function() {
		const map = new sass.types.Map(15);
		map.setKey(0, new sass.types.String('null'));
		map.setValue(0, sass.types.Null.NULL);
		map.setKey(1, new sass.types.String('true'));
		map.setValue(1, sass.types.Boolean.TRUE);
		map.setKey(2, new sass.types.String('false'));
		map.setValue(2, sass.types.Boolean.FALSE);
		map.setKey(3, new sass.types.String('string'));
		map.setValue(3, new sass.types.String('string'));
		map.setKey(4, new sass.types.String('string_number'));
		map.setValue(4, new sass.types.String('1'));
		map.setKey(5, new sass.types.String('positive'));
		map.setValue(5, new sass.types.Number(1));
		map.setKey(6, new sass.types.String('zero'));
		map.setValue(6, new sass.types.Number(0));
		map.setKey(7, new sass.types.String('negative'));
		map.setValue(7, new sass.types.Number(-1));
		map.setKey(8, new sass.types.String('zero_px'));
		map.setValue(8, new sass.types.Number(0, 'px'));
		map.setKey(9, new sass.types.String('ten_em'));
		map.setValue(9, new sass.types.Number(10, 'em'));
		map.setKey(10, new sass.types.String('fifty_percent'));
		map.setValue(10, new sass.types.Number(50, '%'));
		map.setKey(11, new sass.types.String('color_without_alpha'));
		map.setValue(11, new sass.types.Color(0, 0, 0, 1));
		map.setKey(12, new sass.types.String('color_with_alpha'));
		map.setValue(12, new sass.types.Color(100, 110, 100, 0.5));

		const sublist = new sass.types.List(3);
		sublist.setValue(0, new sass.types.String('listelem1'));
		sublist.setValue(1, new sass.types.String('listelem2'));
		sublist.setValue(2, new sass.types.String('listelem3'));

		map.setKey(13, new sass.types.String('list'));
		map.setValue(13, sublist);

		const submap = new sass.types.Map(3);
		submap.setKey(0, new sass.types.String('prop1'));
		submap.setValue(0, new sass.types.String('mappropelem1'));
		submap.setKey(1, new sass.types.String('prop2'));
		submap.setValue(1, new sass.types.String('mappropelem2'));
		submap.setKey(2, new sass.types.String('prop3'));
		submap.setValue(2, new sass.types.String('mappropelem3'));

		map.setKey(14, new sass.types.String('map'));
		map.setValue(14, submap);

		// map.setKey(15, sass.types.String('variable')); TODO?
		// map.setValue(15, new sass.types.String('$variable'));

		const object = nodeSassVarsToJs.convert(map);

		expect(Object.keys(object).length).toEqual(map.getLength());

		// Null
		expect(Object.keys(object)).toContain('null');
		expect(object.null).toEqual(null);

		// Boolean
		expect(Object.keys(object)).toContain('true');
		expect(object.true).toEqual(true);
		expect(Object.keys(object)).toContain('false');
		expect(object.false).toEqual(false);

		// String
		expect(Object.keys(object)).toContain('string');
		expect(object.string).toEqual('string');
		expect(Object.keys(object)).toContain('string_number');
		expect(object.string_number).toEqual('1');

		// Number
		expect(Object.keys(object)).toContain('positive');
		expect(object.positive).toEqual(1);
		expect(Object.keys(object)).toContain('zero');
		expect(object.zero).toEqual(0);
		expect(Object.keys(object)).toContain('negative');
		expect(object.negative).toEqual(-1);
		expect(Object.keys(object)).toContain('zero_px');
		expect(object.zero_px).toEqual('0px');
		expect(Object.keys(object)).toContain('ten_em');
		expect(object.ten_em).toEqual('10em');
		expect(Object.keys(object)).toContain('fifty_percent');
		expect(object.fifty_percent).toEqual('50%');

		// Color
		expect(Object.keys(object)).toContain('color_without_alpha');
		expect(object.color_without_alpha).toEqual('#000000');
		expect(Object.keys(object)).toContain('color_with_alpha');
		expect(object.color_with_alpha).toEqual('rgba(100, 110, 100, 0.5)');

		// List
		expect(Object.keys(object)).toContain('list');
		expect(object.list.length).toEqual(3);
		expect(object.list[0]).toEqual('listelem1');

		// Map
		expect(Object.keys(object)).toContain('map');
		expect(Object.keys(object.map).length).toEqual(3);
		expect(Object.keys(object.map)).toContain('prop1');
		expect(object.map.prop1).toEqual('mappropelem1');
	});
});
