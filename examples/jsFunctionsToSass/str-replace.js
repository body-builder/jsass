const path = require('path');
const sass = require('node-sass');
const JSFunctionsToSass = require('../../src/JSFunctionsToSass');
const jsFunctionsToSass = new JSFunctionsToSass({ implementation: sass });

console.log('\nAdding a `str-replace` function to Sass\n');

/**
 * This example demonstrates the simplest usage of JSFunctionsToSass, adding a `str-replace` function to Sass
 */
sass.render({
	file: path.resolve(__dirname, './str-replace.scss'),
	functions: jsFunctionsToSass.convert({
		// Read more about the syntax possibilities in https://github.com/body-builder/jsass#easy-syntax
		str_replace: function str_replace(string, search, replace) {
			if (typeof string !== 'string') {
				throw new Error('str-replace needs `$string` to be typeof string!');
			}
			return string.replace(new RegExp(search, 'g'), replace);
		}
	})
}, (err, result) => {
	if (err) {
		throw new Error(err);
	}

	console.log(result.css.toString());
});
