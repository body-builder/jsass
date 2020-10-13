const path = require('path');
const sass = require('node-sass');
const JSFunctionsToSass = require('../../src/JSFunctionsToSass');
const jsFunctionsToSass = new JSFunctionsToSass({ implementation: sass });

console.log('\nUsing an async JS function in JSFunctionsToSass\n');

/**
 * This example demonstrates how to use an async JS function in JSFunctionsToSass
 */
sass.render({
	file: path.resolve(__dirname, './fetch-base-64.scss'),
	functions: jsFunctionsToSass.convert({
		'fetch-base-64($url, $contentType: null)': function (url, contentType) {
			return new Promise((resolve, reject) => {
				// Credits for original function to Dan Kohn (https://stackoverflow.com/a/17133012/3111787)
				var request = require('request').defaults({ encoding: null });

				request.get(url, function (error, response, body) {
					if (error) {
						reject(error);
					}

					if (response.statusCode !== 200) {
						reject(`Wrong status code: ${response.statusCode}`);
					}

					contentType = contentType || response.headers['content-type'].replace(' ', '');

					resolve('data:' + contentType + ';base64,' + new Buffer.from(body).toString('base64'));
				});
			});
		}
	})
}, (err, result) => {
	if (err) {
		throw new Error(err);
	}

	console.log(result.css.toString());
});
