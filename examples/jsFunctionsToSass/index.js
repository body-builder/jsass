const path = require('path');
const { myLoop } = require('../helpers');

console.log('Please check the following some examples!');

myLoop([
	path.resolve('./str-replace.js'),
	path.resolve('./map-get-super.js'),
	path.resolve('./url-join.js'),
	path.resolve('./fetch-base-64.js'),
]);