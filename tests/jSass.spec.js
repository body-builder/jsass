const sassExtractOutput = require('./assets/sass-extract-sass-variables');
const { JSass } = require('../src/JSass');
const jSass = new JSass(sassExtractOutput);

describe('jSass', function() {
	it("Should throw error if the requested variable doesn't exist", function() {
		expect(() => jSass.get('$notDefinedVariable')).toThrow(new Error('No variable found with key "$notDefinedVariable"'));
	});

	it('Should convert simple Sass types to their JS equivalents', function() {
		expect(jSass.get('$null')).toEqual(null); // SassNull
		expect(jSass.get('$bool')).toEqual(true); // SassBoolean
		expect(jSass.get('$string_unquoted')).toEqual('string'); // SassString
		expect(jSass.get('$string_quoted')).toEqual('string'); // SassString
		expect(jSass.get('$number_without_unit')).toEqual(1); // SassNumber without unit
		expect(jSass.get('$number_with_unit')).toEqual('1px'); // SassNumber with unit
		expect(jSass.get('$color_without_alpha')).toEqual('#000000'); // SassColor without alpha channel
		expect(jSass.get('$color_with_alpha')).toEqual('rgba(0, 0, 0, 0.5)'); // SassColor with alpha channel
		expect(jSass.get('$list_space')).toEqual(['a', 'b', 'c']); // Space-separated SassList
		expect(jSass.get('$list_comma')).toEqual(['a', 'b', 'c']); // Comma-separated SassList
		expect(jSass.get('$map')).toEqual({ a: 'a', b: 'b', c: 'c' }); // SassMap
	});

	it('Should convert nested Sass types to their JS equivalents', function() {
		// prettier-ignore
		expect(jSass.get('$list_mixed')).toEqual([
			null,
			true,
			'string',
			'string',
			1,
			'1px',
			'#000000',
			'rgba(0, 0, 0, 0.5)',
			[ 'a', 'b', 'c'],
			[ 'a', 'b', 'c'],
			{ a: 'a', b: 'b', c: 'c' }
		]);

		expect(jSass.get('$map_mixed')).toEqual({
			null: null,
			bool: true,
			string_unquoted: 'string',
			string_quoted: 'string',
			number_without_unit: 1,
			number_with_unit: '1px',

			color_without_alpha: '#000000',
			color_with_alpha: 'rgba(0, 0, 0, 0.5)',
			white: '#ffffff', // Key is SassColor in Sass, but should be String in JS
			black: '#000000', // Key is SassColor in Sass, but should be String in JS
			list_space: ['a', 'b', 'c'],
			list_comma: ['a', 'b', 'c']
		});
	});
});
