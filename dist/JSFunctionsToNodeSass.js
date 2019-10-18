"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var kindOf = require('kind-of');

var JSVarsToNodeSass = require('./JSVarsToNodeSass');

var NodeSassVarsToJs = require('./NodeSassVarsToJs');

var JSFunctionsToNodeSass =
/*#__PURE__*/
function () {
  function JSFunctionsToNodeSass(options) {
    _classCallCheck(this, JSFunctionsToNodeSass);

    this._default_options = {
      listSeparator: ', ',
      quote: "'" // prettier-ignore

    };
    this._options = Object.assign({}, this._default_options, options);
    this._jsVarsToNodeSass = new JSVarsToNodeSass();
    this._nodeSassVarsToJs = new NodeSassVarsToJs();
    this.convert = this._wrapObject;
  }
  /**
   * Parses the Sass function declaration string and returns the extracted information in an Object
   * @param key The Sass function declaration string (the `key` of the node-sass `options.functions` object), eg: 'headings($from: 0, $to: 6)'
   * @returns {null|{name: string, args: string[], spreadArgs: number[]}}
   */


  _createClass(JSFunctionsToNodeSass, [{
    key: "_getSassFunctionData",
    value: function _getSassFunctionData(key) {
      var matches = key.replace(')', '').split('('); // The name of the Sass function

      var name = matches[0]; // The list of the arguments

      var args = matches[1].split(','); // The indexes of the arguments, which accepts spread content. This is important, as we also

      var spreadArgs = [];
      args.forEach(function (arg, index) {
        return arg.endsWith('...') && spreadArgs.push(index);
      });

      if (name) {
        return {
          name: name,
          args: args,
          spreadArgs: spreadArgs
        };
      } else {
        return null;
      }
    }
    /**
     * Converts String `error` to an Error, or if it is already an Error, returns it as-is
     * @param {String|Error} error
     * @returns {Error}
     * @private
     */

  }, {
    key: "_createError",
    value: function _createError(error) {
      // prettier-ignore
      return error instanceof Error ? error : new Error(error);
    }
  }, {
    key: "_wrapFunction",
    value: function _wrapFunction(sass_decl, fn) {
      var _this = this;

      var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var options = arguments.length > 3 ? arguments[3] : undefined;

      if (kindOf(sass_decl) !== 'string') {
        throw new Error('JSFunctionsToSass - pass the Sass function declaration to wrapFunction!');
      }

      if (kindOf(fn) !== 'function') {
        throw new Error('JSFunctionsToSass - pass a function to wrapFunction!');
      }

      if (kindOf(args) !== 'array') {
        throw new Error('JSFunctionsToSass - do not forget to pass the arguments from node-sass!');
      }

      options = Object.assign({}, this._options, options);

      var sassFunctionData = this._getSassFunctionData(sass_decl);

      var done = args.slice(-1)[0];
      var sassTypeArgs = args.slice(0, -1); // Converting raw node-sass type arguments to JS

      var jsTypeArgs = [];
      sassTypeArgs.forEach(function (sassTypeArg, index) {
        var jsTypeArg = _this._nodeSassVarsToJs._convert(sassTypeArg, options); // If the Sass function expects the data to be spread for the current argument, we spread the arguments also for the JS function.


        if (kindOf(jsTypeArg) === 'array' && sassFunctionData.spreadArgs.indexOf(index) !== -1) {
          jsTypeArgs.push.apply(jsTypeArgs, _toConsumableArray(jsTypeArg));
        } else {
          jsTypeArgs.push(jsTypeArg);
        }
      }); // Calling the given function with the transformed arguments

      var value;

      try {
        value = fn.apply(null, jsTypeArgs);
      } catch (error) {
        return this._jsVarsToNodeSass._convert(this._createError(error), options);
      } // Returning JS values in node-sass types


      if (value instanceof Promise) {
        if (kindOf(done) !== 'function') {
          throw new Error('JSFunctionsToSass - no callback provided from node-sass!');
        } // TODO Finish error handling tests
        // eslint-disable-next-line prettier/prettier


        value["catch"](function (error) {
          return done(_this._jsVarsToNodeSass._convert(_this._createError(error), options));
        }).then(function (resolved) {
          return done(_this._jsVarsToNodeSass._convert(resolved, options));
        });
      } else {
        return this._jsVarsToNodeSass._convert(value, options);
      }
    }
  }, {
    key: "_wrapObject",
    value: function _wrapObject(obj, options) {
      var _this2 = this;

      if (kindOf(obj) !== 'object') {
        throw new Error('JSFunctionsToSass - pass an object in the following format:\n{\n  \'sass-fn-name($arg1: 0, $arg2: 6)\': function(arg1, arg2) {\n    ...\n  }\n}'); // prettier-ignore
      }

      var newObj = {};
      options = Object.assign({}, this._options, options);
      Object.keys(obj).forEach(function (key, index) {
        var fn = obj[key];

        if (kindOf(fn) !== 'function') {
          throw new Error('JSFunctionsToSass - pass a function to wrapObject!');
        }

        newObj[key] = function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return _this2._wrapFunction(key, fn, args, options);
        };
      });
      return newObj;
    }
  }]);

  return JSFunctionsToNodeSass;
}();

module.exports = JSFunctionsToNodeSass;