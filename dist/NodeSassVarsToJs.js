"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var colorString = require('color-string');

var kindOf = require('kind-of');

var NodeSassVarsToJs =
/*#__PURE__*/
function () {
  function NodeSassVarsToJs(options) {
    _classCallCheck(this, NodeSassVarsToJs);

    this._default_options = {};
    this._options = Object.assign({}, this._default_options, options);
    this.convert = this._convert;
    return this;
  }

  _createClass(NodeSassVarsToJs, [{
    key: "_convert_null",
    value: function _convert_null(value, options) {
      return null;
    }
  }, {
    key: "_convert_boolean",
    value: function _convert_boolean(value, options) {
      return value.getValue();
    }
  }, {
    key: "_convert_number",
    value: function _convert_number(value, options) {
      var result = {
        value: value.getValue(),
        unit: value.getUnit()
      };

      if (result.unit) {
        return result.value + result.unit;
      }

      return result.value;
    }
  }, {
    key: "_convert_color",
    value: function _convert_color(value, options) {
      var result = {
        r: value.getR(),
        g: value.getG(),
        b: value.getB(),
        a: value.getA()
      };

      if (result.a === 1) {
        return colorString.to.hex(result.r, result.g, result.b, result.a);
      }

      return 'rgba(' + result.r + ', ' + result.g + ', ' + result.b + ', ' + result.a + ')';
    }
  }, {
    key: "_convert_string",
    value: function _convert_string(value, options) {
      return value.getValue();
    }
  }, {
    key: "_convert_array",
    value: function _convert_array(value, options) {
      var array = [];

      for (var i = 0; i < value.getLength(); i++) {
        array.push(this._convert(value.getValue(i), options));
      }

      return array;
    }
  }, {
    key: "_convert_object",
    value: function _convert_object(value, options) {
      var object = {};

      for (var i = 0; i < value.getLength(); i++) {
        object[value.getKey(i).getValue()] = this._convert(value.getValue(i), options);
      }

      return object;
    }
  }, {
    key: "_convert",
    value: function _convert(value) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._options;

      switch (kindOf(value)) {
        case 'sassnull':
          return this._convert_null(value, options);

        case 'sassboolean':
          return this._convert_boolean(value, options);

        case 'sassnumber':
          return this._convert_number(value, options);

        case 'sasscolor':
          return this._convert_color(value, options);

        case 'sassstring':
          return this._convert_string(value, options);

        case 'sasslist':
          return this._convert_array(value, options);

        case 'sassmap':
          return this._convert_object(value, options);

        default:
          throw new Error('NodeSassVarsToJs - Unexpected node-sass variable type `' + kindOf(value) + '`');
      }
    }
  }]);

  return NodeSassVarsToJs;
}();

module.exports = NodeSassVarsToJs;