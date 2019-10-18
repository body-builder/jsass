const path = require('path');
const sass = require('node-sass');
const JSFunctionsToNodeSass = require('../../src/JSFunctionsToNodeSass');
const jsFunctionsToNodeSass = new JSFunctionsToNodeSass();

console.log('\nAdding a `str-replace` function to Sass\n');

/**
 * This example demonstrates the simplest usage of JSFunctionsToNodeSass, adding a `str-replace` function to Sass
 */
sass.render({
  file: path.resolve(__dirname, './str-replace.scss'),
  functions: jsFunctionsToNodeSass.convert({
    'str-replace($string, $search, $replace: "")': function (string, search, replace) {
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
