"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var colorString = require('color-string');

var kindOf = require('kind-of');

var JSVarsToSass =
/*#__PURE__*/
function () {
  function JSVarsToSass(options) {
    _classCallCheck(this, JSVarsToSass);

    var _default_options = {
      listSeparator: ', ',
      strict: true
    };
    this._options = Object.assign({}, _default_options, options);
    this.implementation = this._options.implementation || require('node-sass');
    this.unitKeywords_spec = ['cm', 'mm', 'in', 'px', 'pt', 'pc', 'em', 'ex', 'ch', 'rem', 'vh', 'vw', 'vmin', 'vmax', '%'];
    this.unitKeywords_experimental = ['Q', 'cap', 'ic', 'lh', 'rlh', 'vi', 'vb'];
    this.unitKeywords = [].concat(_toConsumableArray(this.unitKeywords_spec), _toConsumableArray(this.unitKeywords_experimental));
    this.convert = this._convert;
    return this;
  }

  _createClass(JSVarsToSass, [{
    key: "_isVariable",
    value: function _isVariable(value) {
      return value.startsWith('$');
    }
    /**
     * Changes the configuration of the instance
     *
     * @param options
     * @returns {JSVarsToSass}
     */

  }, {
    key: "setOption",
    value: function setOption(options) {
      if (!(options instanceof Object)) {
        if (arguments[1] !== undefined) {
          options = _defineProperty({}, options, arguments[1]);
        } else {
          throw new Error('JSVarsToSass: setOption needs an option');
        }
      }

      this._options = Object.assign(this._options, options);
      return this;
    }
    /**
     * Checks whether the given value is a valid CSS color. Returns { r: 0–255, g: 0–255, b: 0–255 a: 0–1 } if so, `false` otherwise
     * @param value
     * @returns {boolean|{r: Number, g: Number, b: Number, a: Number}}
     * @private
     */

  }, {
    key: "_isColor",
    value: function _isColor(value) {
      var isColor = colorString.get(value);

      if (!isColor || !isColor.value) {
        return false;
      }

      var _isColor$value = _slicedToArray(isColor.value, 4),
          r = _isColor$value[0],
          g = _isColor$value[1],
          b = _isColor$value[2],
          a = _isColor$value[3]; // prettier-ignore


      return {
        r: r,
        g: g,
        b: b,
        a: a
      };
    }
    /**
     * Checks whether the given value is a valid CSS number with a unit. Returns { value: Number, unit: String } if so, `false` otherwise
     * @param value
     * @returns {boolean}
     * @private
     */

  }, {
    key: "_hasUnit",
    value: function _hasUnit(value) {
      if (typeof value === 'number') return false;
      var returnObj;
      var match = this.unitKeywords.some(function (unit) {
        var valueNumber = parseFloat(value),
            // `12` from `12px`
        valueUnit = value.replace(/\d+?/g, ''); // `px` from `12px`

        if (valueNumber + unit.toLowerCase() === value.toLowerCase()) {
          returnObj = {
            value: valueNumber,
            unit: valueUnit
          };
          return true;
        }
      });
      return match ? returnObj : match;
    }
  }, {
    key: "_convert",
    value: function _convert(value) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._options;
      var type = kindOf(value);

      switch (type) {
        case 'undefined':
        case 'null':
          return this._convert_null(value, options);

        case 'boolean':
          return this._convert_boolean(value, options);

        case 'number':
          return this._convert_number(value, options);

        case 'string':
          return this._convert_string(value, options);

        case 'array':
          return this._convert_array(value, options);

        case 'object':
          return this._convert_object(value, options);

        case 'error':
          return this._convert_error(value, options);

        default:
          if (this._options.strict === false) {
            return new this.implementation.types.String("[JS ".concat(type.replace(/./, function (x) {
              return x.toUpperCase();
            }), "]"));
          } else {
            throw new Error('JSVarsToSass - Unexpected variable type `' + kindOf(value) + '`');
          }

      }
    }
  }, {
    key: "_convert_null",
    value: function _convert_null(value, options) {
      return this.implementation.types.Null.NULL;
    }
  }, {
    key: "_convert_boolean",
    value: function _convert_boolean(value, options) {
      switch (value) {
        case true:
          return this.implementation.types.Boolean.TRUE;

        case false:
          return this.implementation.types.Boolean.FALSE;
      }
    }
  }, {
    key: "_convert_error",
    value: function _convert_error(value, options) {
      return new this.implementation.types.Error(value.message);
    }
    /**
     * Converts a JS Number or a { value: Number, unit: String } object to a SassNumber instance
     * @param value
     * @param options
     * @returns {*|number}
     * @private
     */

  }, {
    key: "_convert_number",
    value: function _convert_number(value, options) {
      if (kindOf(value) !== 'object') {
        value = {
          value: value,
          unit: ''
        };
      }

      return new this.implementation.types.Number(value.value, value.unit);
    }
    /**
     * Converts a JS String to a SassString instance
     * If the value of the string is a number with a unit, it will be converted to a SassNumber with a unit
     * @param value
     * @param options
     * @returns {*|number|*|string|*}
     * @private
     */

  }, {
    key: "_convert_string",
    value: function _convert_string(value, options) {
      var isColor = this._isColor(value);

      if (isColor) {
        return this._convert_color(isColor, options);
      }

      var hasUnit = this._hasUnit(value);

      if (hasUnit) {
        return this._convert_number(hasUnit, options);
      }

      return new this.implementation.types.String(value);
    }
  }, {
    key: "_convert_color",
    value: function _convert_color(_ref, options) {
      var r = _ref.r,
          g = _ref.g,
          b = _ref.b,
          a = _ref.a;
      return new this.implementation.types.Color(r, g, b, a);
    }
  }, {
    key: "_convert_array",
    value: function _convert_array(value, options) {
      var _this = this;

      if (kindOf(value) !== 'array') throw new Error('JSFunctionsToSass - _convert_array() needs an array, but got `' + kindOf(value) + '`');
      var list = new this.implementation.types.List(value.length, options.listSeparator.trim() === ',');
      value.map(function (item, index) {
        return list.setValue(index, _this._convert(item, options));
      });
      return list;
    }
  }, {
    key: "_convert_object",
    value: function _convert_object(value, options) {
      var _this2 = this;

      if (kindOf(value) !== 'object') throw new Error('JSFunctionsToSass - _convert_object() needs an array, but got `' + kindOf(value) + '`');
      var map = new this.implementation.types.Map(Object.keys(value).length);
      Object.keys(value).map(function (key, index) {
        map.setKey(index, _this2._convert(key, options));
        map.setValue(index, _this2._convert(value[key], options));
      });
      return map;
    }
  }]);

  return JSVarsToSass;
}();

module.exports = JSVarsToSass;