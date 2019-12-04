const path = require('path');
const sass = require('node-sass');
const JSFunctionsToSass = require('../../src/JSFunctionsToSass');
const jsFunctionsToSass = new JSFunctionsToSass({ implementation: sass });

const urljoin = require('url-join');

console.log('\nAdding a `url-join` function to Sass, using the `url-join` NPM package\n');

/**
 * This example adds a `url-join` function to Sass, using the `url-join` NPM package
 */
sass.render({
  file: path.resolve(__dirname, './url-join.scss'),
  functions: jsFunctionsToSass.convert({
    // Read more about the syntax possibilities in https://github.com/body-builder/jsass#easy-syntax
    urljoin
  })
}, (err, result) => {
  if (err) {
    throw new Error(err);
  }

  console.log(result.css.toString());
});
