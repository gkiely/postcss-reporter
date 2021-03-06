# postcss-reporter 
[![Build Status](https://travis-ci.org/postcss/postcss-reporter.svg?branch=master)](https://travis-ci.org/postcss/postcss-reporter)[![AppVeyor Build Status](https://img.shields.io/appveyor/ci/davidtheclark/postcss-reporter/master.svg?label=windows%20build)](https://ci.appveyor.com/project/davidtheclark/postcss-reporter)

A PostCSS plugin to `console.log()` the messages (warnings, etc.) registered by other PostCSS plugins.

## Purpose

As of PostCSS 4.1, a single PostCSS process can accumulate messages from all of the plugins it uses.
Most of these messages are [warnings](https://github.com/postcss/postcss/blob/master/docs/guidelines/plugin.md#32-use-resultwarn-for-warnings).
Presumably, plugin authors want you to see those messages.
So this plugin exists to read the accumulated messages (or messages from only the plugins you've specified), format them, and print them to the console.

By default, the messages are formatted for human legibility and sorted according to the line/column positions attached to the messages. But another formatting function can be passed in with an option, and sorting can be turned of with an option.

## Example Output

![Example](example.png?raw=true)

## Installation

```
npm install postcss-reporter
```

Version 1.0.0+ is compatible with PostCSS 5+. (Earlier versions are compatible with PostCSS 4.)

## Usage

Add it to your plugin list *after any plugins whose messages you want to log*, and optionally pass it an object of options.

For example, using [gulp-postcss](https://github.com/postcss/gulp-postcss):

```js
gulp.task('css', function() {
  return gulp.src('./src/*.css')
    .pipe(postcss([
      bemLinter(),
      customProperties(),
      calc(),
      rejectAllColors(),
      reporter(myOptions) // <------ ding
    ]))
    .pipe(gulp.dest('./dist'));
});
```

## Options

**clearMessages** (boolean, default = `false`)

If true, the plugin will clear the result's messages after it logs them. This prevents other plugins, or the whatever runner you use, from logging the same information again and causing confusion.

**formatter** (function, default = the default formatter)

By default, this reporter will format the messages for human legibility in the console.
To use another formatter, pass a function that

  - accepts an object containing a `messages` array and a `source` string
  - returns the string to report

For example, you could write a formatter like this:

```js
reporter({
  formatter: function(input) {
    return input.source + ' produced ' + input.messages.length + ' messages';
  }
})
```

**plugins** (array of strings, default = `[]`)

If empty, the plugin will log every message, regardless of which plugin registered it.
To limit output, name the plugins whose messages you would like to see.
For example, `{ plugins: ['postcss-bem-linter'] }` will only log messages from the `postcss-bem-linter` plugin.

**throwError** (boolean, default = `false`)

If `true`, after the plugin logs your messages it will throw an error if it found any warnings.

**sortByPosition** (boolean, default = `true`)

If `false`, messages will not be sorted by line/column position.

**positionless** (`"first"|"last"|"any"`, default = `"first"`)

By default, messages without line/column positions will be grouped at the beginning of the output.
To put them at the end, instead, use `"last"`.
To not bother sorting these, use `"any"`.

**noIcon** (boolean, default = `false`)

If `true`, no exclamatory triangle icons will be printed next to warnings.

**noPlugin** (boolean, default = `false`)

If `true`, plugin names will not be printed in brackets after messages.

## How to get output without colors

If you would like no colors in the console output, simply pass `--no-colors` when you invoke whatever command runs this plugin. (This works because of [chalk](https://github.com/sindresorhus/chalk).)

## Standalone formatter

You can also use this module's formatter as a library, with following API:

```js
var formatter = require('postcss-reporter/lib/formatter');
var myFormatter = formatter(myOptions);
// to use defaults, just pass no options: `formatter()`
var warningLog = myFormatter({
  messages: someMessages,
  source: someSource
});
console.log(warningLog);
```

These are the formatter's options:

- sortByPosition (boolean, default = `true`)
- noIcon (boolean, default = `false`) - Do not print any warning exclamatory triangle icons
- noPlugin (boolean, default = `false`) - Do not print plugin names
