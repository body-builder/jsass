const path = require('path');
const sass = require('node-sass');
const JSFunctionsToNodeSass = require('../../src/JSFunctionsToNodeSass');
const jsFunctionsToNodeSass = new JSFunctionsToNodeSass({ implementation: sass });

const urljoin = require('url-join');

console.log('\nAdding a `url-join` function to Sass, using the `url-join` NPM package\n');

/**
 * This example adds a `url-join` function to Sass, using the `url-join` NPM package
 */
sass.render({
  file: path.resolve(__dirname, './url-join.scss'),
  functions: jsFunctionsToNodeSass.convert({
    'url-join($paths...)': urljoin
  })
}, (err, result) => {
  console.log(result.css.toString());
});
