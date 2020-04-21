/**
 * Returns the Sass implementation based on the `extractOptions`. Resolves the implementation in the following order: `compileOptions.implementation` || `Node Sass` || `Dart Sass`
 */
export function getSassImplementation(options = {}) {
	const implementation = options.implementation || require('node-sass') || require('sass');

	if (!implementation.info || !['node-sass', 'dart-sass'].includes(implementation.info.split('\t')[0])) {
		throw new Error('The given Sass implementation is invalid. Should be one of `node-sass` or `sass`.');
	}

	return implementation;
}

/**
 * The constructor of Dart Sass' Booleans and Null values do not match any of the constructors in `sass.types` in Dart Sass.
 */
export function getConstructor(sassValue, sass) {
	switch (sassValue.constructor) {
		case sass.types.Boolean.TRUE.constructor:
		case sass.types.Boolean.FALSE.constructor: // Both TRUE and FALSE have the same constructor, but for clarity's sake
			return sass.types.Boolean;

		case sass.types.Null.NULL.constructor:
			return sass.types.Null;

		default:
			return sassValue.constructor;
	}
}

/**
 * Returns the constructor name of the given Sass value type.
 * Until 1.2.5, Dart Sass did not report the constructor name in a human readable format, this is why we need to use this helper.
 */
export function getConstructorName(sassValue, sass) {
	switch (getConstructor(sassValue, sass)) {
		case sass.types.String:
			return 'SassString';

		case sass.types.Boolean:
			return 'SassBoolean';

		case sass.types.Number:
			return 'SassNumber';

		case sass.types.Color:
			return 'SassColor';

		case sass.types.Null:
			return 'SassNull';

		case sass.types.List:
			return 'SassList';

		case sass.types.Map:
			return 'SassMap';

		default:
			throw new Error(`Unsupported Sass constructor '${sassValue.constructor.name}'`);
	}
}
