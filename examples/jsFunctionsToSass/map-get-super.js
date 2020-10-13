const path = require('path');
const sass = require('node-sass');
const JSFunctionsToSass = require('../../dist/JSFunctionsToSass');
const jsFunctionsToSass = new JSFunctionsToSass({ implementation: sass });

const _ = require('lodash');

console.log('\nAdvanced `map-get` function for Sass, using lodash\'s `get()`, making it possible to get the value of a nested Map (or List) by its path (eg. `deeply.nested.value`)\n');

/**
 * This example implements an advanced `map-get` function in Sass, using lodash's `get()`, making it possible to get the value of a nested Map (or List) by its path (eg. `deeply.nested.value`).
 */
sass.render({
	file: path.resolve(__dirname, './map-get-super.scss'),
	functions: jsFunctionsToSass.convert({
		// We need to stringify the map in the demo CSS to prevent Dart Sass from throwing `Error: ("deeply": ("nested": ("value": "jSass"))) isn't a valid CSS value.`
		'stringify($map)': JSON.stringify,
		'map-get-super($map, $path)': _.get
	})
}, (err, result) => {
	if (err) {
		throw new Error(err);
	}

	console.log(result.css.toString());
});
