"use strict";

var _require = require('./JSass'),
    JSass = _require.JSass;
/**
 * `sass-extract` postExtract plugin, which uses JSass to return a minimal-footprint bundle output: { global: { }}
 * @see https://github.com/jgranstrom/sass-extract#plugins
 */


module.exports = {
  run: function run() {
    return {
      postExtract: function postExtract(extractedVariables) {
        var jSass = new JSass(extractedVariables),
            compactedVariables = {};
        Object.keys(extractedVariables).forEach(function (context) {
          compactedVariables[context] = {};
          Object.keys(extractedVariables[context]).forEach(function (key) {
            compactedVariables[context][key] = jSass.get(key);
          });
        });
        return compactedVariables;
      }
    };
  }
};