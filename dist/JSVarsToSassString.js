"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var kinfOf = require('kind-of');

var JSVarsToNodeSass = require('./JSVarsToNodeSass');

var NodeSassVarsToJs = require('./NodeSassVarsToJs');
/**
 * Converts JS variables (Bool, Number, String, Array, Object) to the 'corresponding' Sass variable definitions (Array -> List, Object -> Map, String -> String|Color|Unit, etc...)
 * Important: This Class outputs string data, which can be passed to the `data` option of node-sass (see https://github.com/sass/node-sass#data)
 */


var JSVarsToSassString =
/*#__PURE__*/
function (_JSVarsToNodeSass) {
  _inherits(JSVarsToSassString, _JSVarsToNodeSass);

  /**
   * @param options
   * @returns {{setOption: JSVarsToSassString.setOption|*, convert: JSVarsToSassString._iterator|*}}
   * @constructor
   */
  function JSVarsToSassString(options) {
    var _this;

    _classCallCheck(this, JSVarsToSassString);

    // prettier-ignore
    _this = _possibleConstructorReturn(this, _getPrototypeOf(JSVarsToSassString).call(this, Object.assign({}, {
      syntax: 'scss',
      quotedKeys: true,
      // Though Sass allows map keys to be of any Sass type, it is recommended to use quoted strings to avoid confusing problems (see https://sass-lang.com/documentation/values/maps)
      listSeparator: ', ',
      quote: "'" // prettier-ignore

    }, options)));
    _this.convert = _this._iterator;
    _this._nodeSassVarsToJs = new NodeSassVarsToJs();
    return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
  }

  _createClass(JSVarsToSassString, [{
    key: "_stringify",
    value: function _stringify(value, options) {
      return options.quote + value + options.quote;
    }
  }, {
    key: "_convert",
    value: function _convert(value) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._options;
      value = _get(_getPrototypeOf(JSVarsToSassString.prototype), "_convert", this).call(this, value, options); // The super function may itself return value in edge-cases, and those values are in Sass types. We need to resolve it.

      if (kinfOf(value).startsWith('sass')) {
        return this._convert(this._nodeSassVarsToJs.convert(value), options);
      }

      return value;
    }
  }, {
    key: "_convert_null",
    value: function _convert_null(value, options) {
      return null;
    }
  }, {
    key: "_convert_boolean",
    value: function _convert_boolean(value, options) {
      return value;
    }
  }, {
    key: "_convert_number",
    value: function _convert_number(value, options) {
      return value;
    }
  }, {
    key: "_convert_string",
    value: function _convert_string(value, options) {
      // Returning the value _without quotes_ in some general cases
      if (this._isVariable(value) || this._isColor(value) || this._hasUnit(value)) return value;
      return this._stringify(value, options);
    }
  }, {
    key: "_convert_array",
    value: function _convert_array(value, options) {
      var _this2 = this;

      var returnArr = [];
      value.forEach(function (_value, index) {
        return returnArr.push(_this2._convert(_value, options));
      });
      return '(' + returnArr.join(options.listSeparator) + ')';
    }
  }, {
    key: "_convert_object",
    value: function _convert_object(value, options) {
      var _this3 = this;

      var returnObj = {};
      Object.keys(value).forEach(function (key, index) {
        return returnObj[key] = _this3._convert(value[key], options);
      });
      return '(' + Object.keys(returnObj).map(function (key, index) {
        var fixedKey = key;

        if (options.quotedKeys !== false) {
          fixedKey = _this3._stringify(key, options);
        }

        return fixedKey + ': ' + returnObj[key];
      }).join(options.listSeparator) + ')'; // prettier-ignore
    }
    /**
     * Creates the string value of a single Sass variable definition.
     *
     * @param key Name of the Sass variable
     * @param value Value of the Sass variable
     * @param options
     * @returns {string}
     */

  }, {
    key: "_createVariable",
    value: function _createVariable(key, value, options) {
      options = Object.assign({}, this._options, options);
      var returnData = [];
      var sassKey = '$' + key;

      var sassValue = this._convert(value, options);

      if (sassValue === undefined) throw new Error('JSVarsToSass could not convert the following variable: ' + key);
      returnData.push(sassKey + ': ' + sassValue);
      if (options.flags) options.flags.map(returnData.push());
      if (options.syntax === 'scss') returnData.push(';');
      return returnData.join(''); // We are joining the Array without commas
    }
    /**
     * The main query, which iterates over the values, collects the _createVariable() responses to a JS array, and returns it as string joined with newlines.
     *
     * Accepts two syntaxes:
     *  - 3 parameters: key, value, [options]
     *  - 2 parameters: { key: value }, [options]
     *
     * @param values
     * @param options
     * @returns {string}
     */

  }, {
    key: "_iterator",
    value: function _iterator(values, options) {
      var _this4 = this;

      if (!arguments.length) throw new Error('JSVarsToSass: no arguments provided!'); // Converting the 3-parameters-syntax to the 2-parameters syntax

      if (!(values instanceof Object)) {
        values = _defineProperty({}, arguments[0], arguments[1]);
        options = arguments[2];
      }

      var returnData = Object.keys(values).map(function (key) {
        return _this4._createVariable(key, values[key], options);
      });
      return returnData.join('\n');
    }
  }]);

  return JSVarsToSassString;
}(JSVarsToNodeSass);

module.exports = JSVarsToSassString;