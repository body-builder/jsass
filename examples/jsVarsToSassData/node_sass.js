const fs = require('fs');
const path = require('path');
const sass = require('node-sass');

const JSVarsToSassData = require('../../dist/JSVarsToSassData');
const jsVarsToSassData = new JSVarsToSassData();

console.log('\nInjecting JS variables to Sass using the `data` option of `sass.render()`\n');

/**
 * This example demonstrates how to inject JS variables to Sass using the `data` option of `sass.render()`
 */
const data = jsVarsToSassData.convert({
	ENV: process.env.NODE_ENV,
	DEV: process.env.NODE_ENV === 'development',
	variable: 'variable',
	importantList: ['some', 'important', 'value'],
	importantMap: {
		bool: true,
		string: 'string',
		variable: '$variable',
		color: '#646e64', // By default we are using this value, just edit your `node_sass.scss` to see other injected values
		unit: '12px'
	},
	nestedValues: {
		array: ['some', 'important', 'value'],
		map: {
			bool: true,
			string: 'string',
			variable: '$variable',
			color: 'rgba(100, 110, 100, 0.5)',
			unit: '12px'
		},
		thatsAll: false
	}
});

const file = fs.readFileSync(path.resolve('./node_sass.scss'), 'utf8');

sass.render({
	data: [data, file].join('\n'),
}, (err, result) => {
	if (err) {
		throw new Error(err);
	}

	console.log(result.css.toString());

	if (process.env.NODE_ENV !== 'development') {
		console.log('Now try with `$ npm run dev`');
	} else {
		console.log('You can try also `$ npm run start`');
	}
});
