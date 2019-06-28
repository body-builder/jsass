const jsVarsToDefinePlugin = require('../src/jsVarsToDefinePlugin');

describe('jsVarsToDefinePlugin', function() {
	it('Should wrap all values in quotes', function() {
		expect(jsVarsToDefinePlugin({ key: true })).toEqual({ key: 'true' });
		expect(jsVarsToDefinePlugin({ key: false })).toEqual({ key: 'false' });
		expect(jsVarsToDefinePlugin({ key: null })).toEqual({ key: 'null' });
		expect(jsVarsToDefinePlugin({ key: 1 })).toEqual({ key: '1' });
		expect(jsVarsToDefinePlugin({ key: 0 })).toEqual({ key: '0' });
		expect(jsVarsToDefinePlugin({ key: -1 })).toEqual({ key: '-1' });
		expect(jsVarsToDefinePlugin({ key: 'value' })).toEqual({ key: '"value"' });
	});
	it('Should iterate over every Object keys', function() {
		// prettier-ignore
		expect(jsVarsToDefinePlugin({
			bool: true,
			null: null,
			positive_number: 1,
			zero: 0,
			negative_number: -1,
			string: 'string'
		})).toEqual({
			bool: 'true',
			null: 'null',
			positive_number: '1',
			zero: '0',
			negative_number: '-1',
			string: '"string"'
		});
	});
});
