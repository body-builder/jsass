const path = require('path');
const sass = require('node-sass');
const JSFunctionsToNodeSass = require('../../src/JSFunctionsToNodeSass');
const jsFunctionsToNodeSass = new JSFunctionsToNodeSass();

const _ = require('lodash');

console.log('\nAdvanced `map-get` function for Sass, using lodash\'s `get()`, making it possible to get the value of a nested Map (or List) by its path (eg. `deeply.nested.value`)\n');

/**
 * This example implements an advanced `map-get` function in Sass, using lodash's `get()`, making it possible to get the value of a nested Map (or List) by its path (eg. `deeply.nested.value`).
 */
sass.render({
  file: path.resolve(__dirname, './map-get-super.scss'),
  functions: jsFunctionsToNodeSass.convert({
    'map-get-super($map, $path)': _.get
  })
}, (err, result) => {
  console.log(result.css.toString());
});
