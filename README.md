# jSass

[![npm version](https://badge.fury.io/js/jsass.svg)](http://badge.fury.io/js/jsass)
[![dependencies Status](https://david-dm.org/body-builder/jsass/status.svg)](https://david-dm.org/body-builder/jsass)
[![devDependencies Status](https://david-dm.org/body-builder/jsass/dev-status.svg)](https://david-dm.org/body-builder/jsass?type=dev)
[![peerDependencies Status](https://david-dm.org/body-builder/jsass/peer-status.svg)](https://david-dm.org/body-builder/jsass?type=peer)
[![Build Status](https://travis-ci.com/body-builder/jsass.svg?branch=master)](https://travis-ci.com/body-builder/jsass)

Share functions and variables between JS and Sass.  
Supports both [Node Sass](https://github.com/sass/node-sass) and [Dart Sass](https://github.com/sass/dart-sass).

------

- [Installation](#installation)
- [Features](#features)
  - [Use JavaScript functions directly in your Sass code](#use-javascript-functions-directly-in-your-sass-code)
  - [Share Sass variables with JS](#share-sass-variables-with-js)
  - [Share JS variables with Sass](#share-js-variables-with-sass)
- [Contributing](#contributing)


## Installation
```bash
npm install jsass
```

## Features


### Use JavaScript functions directly in your Sass code

Since Node Sass v3.0.0, and Dart Sass v1.0.0-beta.5.1 the `functions` option makes it possible to pass an Object of JS functions that may be invoked by the sass files being compiled (check [Node Sass docs](https://github.com/sass/node-sass#functions--v300---experimental) or [Dart Sass docs](https://sass-lang.com/documentation/js-api#functions) for more information).

This gives the developers unlimited possibilities for processing Sass data during build-time, but since the connected JS functions receive their parameters and must return their return values in Sass's own data types, this makes a bit more difficult to just use this feature *out-of-the-box*.

This package contains a class (JSFunctionsToSass), which acts like a middleware between Sass and the connected JS function. It converts the received Sass type arguments to their JS equivalents, and applies them as pure JavaScript types to the connected JS function. When the function returned what it has to be, JSFunctionsToSass converts the returned JS value back to its Sass equivalent, and passes back to Sass. So simple.

Both **sync** and **async** functions are supported.

#### Easy syntax

JSFunctionsToSass makes it possible to automatically define the parameters of the Sass function.

If the Sass function signature (the _keys_ of the Sass `options.functions` object) doesn't have a parameter block, it tries to get the parameter names of the JS function, and define the same parameter names also in the Sass function. If we cannot get the parameter names of the given JS function (most probably it doesn't have explicitly declared parameters), we add a single spread parameter for the Sass function (`$arguments...`), making it possible to wrap JS functions which use eg. `arguments` in their body.

This functionality is limited only to Sass function signatures **without a parameter block** (parentheses immediately after the function's name). Sass functions _having_ defined parameters remain untouched, and the same applies if explicitly zero parameters are defined (when the parameter block is empty).

**Note:** `JSFunctionsToSass` cannot detect (and therefore define) the _default values_ of the function parameters. If Sass throws error because of a missing (but only optional) argument, you can fall back anytime to the original Sass signature syntax.

The automatic parameter resolution is completely optional and can be used in parallel with the original syntax.


### Default syntax

```js
const path = require('path');
const sass = require('node-sass');
const { JSFunctionsToSass } = require('jsass/dist/node');
const jsFunctionsToSass = new JSFunctionsToSass();

sass.render({
  file: path.resolve('styles.scss'),
  functions: jsFunctionsToSass.convert({
    // Explicitly defined Sass parameter names
    'str-replace($string, $search, $replace: "")': function str_replace(string, search, replace) {
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
```

### Easier syntax

```js
const path = require('path');
const sass = require('node-sass');
const { JSFunctionsToSass } = require('jsass/dist/node');
const jsFunctionsToSass = new JSFunctionsToSass();

sass.render({
  file: path.resolve('styles.scss'),
  functions: jsFunctionsToSass.convert({
    // Sass parameter names resolved from the JS function
    str_replace: function str_replace(string, search, replace) {
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
```

### Syntax sugar

```js
const path = require('path');
const sass = require('node-sass');
const { JSFunctionsToSass } = require('jsass/dist/node');
const jsFunctionsToSass = new JSFunctionsToSass();
const str_replace = require('./str_replace');

sass.render({
  file: path.resolve('styles.scss'),
  functions: jsFunctionsToSass.convert({
    // Passing only a JS function reference
    str_replace
  })
}, (err, result) => {
  if (err) {
    throw new Error(err);
  }

  console.log(result.css.toString());
});
```

#### Examples
##### Implementing missing in Sass `str-replace` function

```js
const path = require('path');
const sass = require('node-sass');
const { JSFunctionsToSass } = require('jsass/dist/node');
const jsFunctionsToSass = new JSFunctionsToSass();

/**
 * This example demonstrates the simplest usage of JSFunctionsToSass, adding a `str-replace` function to Sass
 */
sass.render({
  file: path.resolve(__dirname, './str-replace.scss'),
  functions: jsFunctionsToSass.convert({
    'str-replace': function (string, search, replace) {
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

```

str-replace.scss
```scss
.string-replace {
  $string: 'The answer to life the universe and everything is 42.';
  string: '#{$string}';
  search: 'e';
  replace: 'xoxo';
  content-replaced: '#{str-replace($string, 'e', 'xoxo')}';
}
```

Output:
```css
.string-replace {
  string: "The answer to life the universe and everything is 42.";
  search: 'e';
  replace: 'xoxo';
  content-replaced: "Thxoxo answxoxor to lifxoxo thxoxo univxoxorsxoxo and xoxovxoxorything is 42.";
}
```

##### Getting nested map value by key (example with Dart Sass **implementation**)

```js
const path = require('path');
const sass = require('sass'); // Now we are using `dart-sass`
const { JSFunctionsToSass } = require('jsass/dist/node');
const jsFunctionsToSass = new JSFunctionsToSass({ implementation: sass });

const _ = require('lodash');

/**
 * This example implements an advanced `map-get` function in Sass, using lodash's `get()`, making it possible to get the value of a nested Map (or List) by its path (eg. `deeply.nested.value`).
 */
sass.render({
  file: path.resolve(__dirname, './map-get-super.scss'),
  functions: jsFunctionsToSass.convert({
    'map-get-super($map, $path)': _.get
  })
}, (err, result) => {
  if (err) {
    throw new Error(err);
  }

  console.log(result.css.toString());
});
```

map-get-super.scss
```scss
$map: (
  'deeply': (
    'nested': (
      'value': 'jSass'
    )
  )
);

.resolved {
  map: '#{$map}';
  path: 'deeply.nested.value';
  content: '#{map-get-super($map, 'deeply.nested.value')}';
}
```

Output:
```css
.resolved {
  map: '("deeply": ("nested": ("value": "jSass")))';
  path: 'deeply.nested.value';
  content: "jSass";
}
```

##### It works also with arbitrary (spread) arguments

```js
const path = require('path');
const sass = require('node-sass');
const { JSFunctionsToSass } = require('jsass/dist/node');
const jsFunctionsToSass = new JSFunctionsToSass();

const urljoin = require('url-join');

/**
 * This example adds a `url-join` function to Sass, using the `url-join` NPM package
 */
sass.render({
  file: path.resolve(__dirname, './url-join.scss'),
  functions: jsFunctionsToSass.convert({
    'url-join($paths...)': urljoin
  })
}, (err, result) => {
  if (err) {
    throw new Error(err);
  }

  console.log(result.css.toString());
});
```

url-join.scss
```scss
.url-join {
  content: '#{('https://', 'github.com', 'body-builder', 'jsass')}';
  content-joined: '#{url-join('https://', 'github.com', 'body-builder', 'jsass')}';
}
```

Output:

```css
.url-join {
  content: "https://, github.com, body-builder, jsass";
  content-joined: "https://github.com/body-builder/jsass";
}
```

### Share Sass variables with JS
jSass makes a good pair with [sass-extract](https://github.com/jgranstrom/sass-extract). We recommend using sass-extract to export your Sass project's variables to JS. Once you are installed it, why don't you query it easily right in your frontend JavaScript code? `JSass` makes this task easy for you. It reads the output Object of `sass-extract`, and converts it to simple JavaScript Strings, Arrays or Objects. You can

If you would like to share some of your CSS selectors with JS, `JSass_mod_jQuery` makes it possible to use your Sass selectors directly in jQuery.

In addition to this, jSass's [sass-extract plugin](https://github.com/body-builder/jsass/blob/master/src/jSass-extract.js) helps you to extract only the really important data to your bundle file.

### Share JS variables with Sass
Sass accepts a `data` option as the source code to compile (check [Node Sass docs here](https://github.com/sass/node-sass#data) or [Dart Sass docs here](https://sass-lang.com/documentation/js-api#data)). This also makes it possible to pass for example Node.js variables to your Sass files. However, `data` must be a string, containing syntactically valid raw Sass code. jSass helps you to stringify any general JavaScript types to their equivalent Sass variable type to raw Sass format. It supports both SCSS and SASS (indented) syntax as output type.

#### Example

```js
const { JSVarsToSassData } = require('jsass/dist/node');
const jsVarsToSassData = new JSVarsToSassData();

process.env.NODE_ENV = 'development';

const data = jsVarsToSassData.convert({
  ENV: process.env.NODE_ENV,
  DEV: process.env.NODE_ENV === 'development',
  variable: 'variable',
  importantList: ['some', 'important', 'value'],
  importantMap: {
    bool: true,
    string: 'string',
    variable: '$variable',
    color: '#646e64',
    unit: '12px'
  },
  nestedValues: {
    array: ['some', 'important', 'value'],
    map: {
      bool: true,
      string: 'string',
      variable: '$variable',
      color: 'rgba(100, 110, 100, 0.5)',
      unit: '12px'
    },
    thatsAll: false
  }
});

console.log(data);
```

Output:
```scss
$ENV: 'development';
$DEV: true;
$variable: 'variable';
$importantList: ('some', 'important', 'value');
$importantMap: ('bool': true, 'string': 'string', 'variable': $variable, 'color': rgb(100, 110, 100), 'unit': 12px);
$nestedValues: ('array': ('some', 'important', 'value'), 'map': ('bool': true, 'string': 'string', 'variable': $variable, 'color': rgb(100, 110, 100), 'unit': 12px), 'thatsAll': false);
```

Use it in Sass:
```js
const fs = require('fs');
const path = require('path');
const sass = require('node-sass');

const { JSVarsToSassData } = require('jsass/dist/node');
const jsVarsToSassData = new JSVarsToSassData();

/**
 * This example demonstrates how to inject JS variables to Sass using the `data` option of `sass.render()`
 */
const data = jsVarsToSassData.convert({
  ENV: process.env.NODE_ENV,
  DEV: process.env.NODE_ENV === 'development',
  variable: 'variable',
  importantList: ['some', 'important', 'value'],
  importantMap: {
    bool: true,
    string: 'string',
    variable: '$variable',
    color: '#646e64', // By default we are using this value, just edit your `node_sass.scss` to see other injected values
    unit: '12px'
  },
  nestedValues: {
    array: ['some', 'important', 'value'],
    map: {
      bool: true,
      string: 'string',
      variable: '$variable',
      color: 'rgba(100, 110, 100, 0.5)',
      unit: '12px'
    },
    thatsAll: false
  }
});

const file = fs.readFileSync(path.resolve('./node_sass.scss'), 'utf8');

sass.render({
  data: [data, file].join('\n'),
}, (err, result) => {
  if (err) {
    throw new Error(err);
  }

  console.log(result.css.toString());
});

```

node_sass.scss
```scss
.selector {
  @if ($DEV == true) {
    background-color: map_get($importantMap, 'color');
  } @else {
    background-color: white;
  }
}
```

Output:
```css
.selector {
  background-color: #646e64; 
}
```

#### Bonus
Use jSass's `jsVarsToDefinePlugin` to be able to _safely_ share the same values with your JS and Sass files:

webpack.config.js
```js
const webpack = require('webpack');
const jsVarsToDefinePlugin = require('jsass/dist/jsVarsToDefinePlugin');

module.exports = {
  ...,
  plugins: [
    new webpack.DefinePlugin(jsVarsToDefinePlugin({
      ENV: process.env.NODE_ENV,
      DEV: process.env.NODE_ENV === 'development',
      variable: 'variable',
      importantList: ['some', 'important', 'value'],
      importantMap: {
        bool: true,
        string: 'string',
        variable: '$variable',
        color: '#646e64',
        unit: '12px'
      },
      nestedValues: {
        array: ['some', 'important', 'value'],
        map: {
          bool: true,
          string: 'string',
          variable: '$variable',
          color: 'rgba(100, 110, 100, 0.5)',
          unit: '12px'
        },
        thatsAll: false
      }
    }))
  ]
};
```

See other examples in the [examples](https://github.com/body-builder/jsass/blob/master/examples) directory. (`$ npm run start` in any folder.)

## Contributing

##### Compile source
```bash
npm run build
```

##### Running tests

```bash
npm run test
```

----

Sponsored by: [SRG Group Kft.](https://srg.hu?en)