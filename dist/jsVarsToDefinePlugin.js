"use strict";

/**
 * A simple converter to be able to directly insert key->value Objects to Webpack's DefinePlugin.
 * > Because the plugin does a direct text replacement, the value given to it must include actual quotes inside of the string itself.
 * @see https://webpack.js.org/plugins/define-plugin/#usage
 * @param obj
 * @returns {{}}
 */
var jsVarsToDefinePlugin = function jsVarsToDefinePlugin(obj) {
  return Object.keys(obj).reduce(function (previous, current) {
    previous[current] = JSON.stringify(obj[current]);
    return previous;
  }, {});
};

module.exports = jsVarsToDefinePlugin;