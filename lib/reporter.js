var chalk = require('chalk');
var _ = require('lodash');
var defaultFormatter = require('./formatter');
var util = require('./util');
var glob = require('glob');
var notifier = require('node-notifier');



module.exports = function(opts) {
  var options = opts || {};

  var formatter = options.formatter || defaultFormatter({
    sortByPosition: (typeof options.sortByPosition !== 'undefined') ? options.sortByPosition : true,
    positionless: options.positionless || 'first',
    noIcon: options.noIcon,
    noPlugin: options.noPlugin,
  });

  var runCount = 0;
  var errorCount = 0;
  var fileCount = 0;
  return function(css, result) {
    var messagesToLog = (!options.plugins || !options.plugins.length)
      ? result.messages
      : result.messages.filter(function(message) {
          return options.plugins.indexOf(message.plugin) !== -1;
        });

    var resultSource = (!result.root.source) ? ''
      : result.root.source.input.file || result.root.source.input.id

    var sourceGroupedMessages = _.groupBy(messagesToLog, function(message) {
      return util.getLocation(message).file || resultSource;
    });

    var report = '';
    _.forOwn(sourceGroupedMessages, function(messages, source) {
      report += formatter({
        messages: messages,
        source: source,
      });
    });

    if (options.clearMessages) {
      result.messages = _.difference(result.messages, messagesToLog);
    }


    if(runCount === 0){
      glob(options.files, function(err, files){
        fileCount = files.length
      });
    }

    runCount++;

    if(report){
      console.log(report);
      errorCount++;
    }    

    if(fileCount === runCount){
      if(errorCount > 0){
        if (options.throwError && shouldThrowError()) {
          console.log("\x07");
          // var WindowsBalloon = notifier.WindowsBalloon;
          // var winNotifier = new WindowsBalloon({
          //   withFallback: false, // Try Windows 8 and Growl first? 
          //   customPath: void 0
          // });

          // winNotifier.notify({
          //   title: 'Stylelint',
          //   message: 'Warnings or errors were found in '+ errorCount + ' files',
          //   time: 4000
          // });
          throw new Error(chalk.red.bold('\n** Stylelint: warnings or errors were found in ' + errorCount + ' files **'));
        }
      }
      else{
        //@todo: calculate % if entire directory is passed in
        // Else print number of files linted
        console.log(chalk.green.bold('\n Stylelint: Passed \u2713 \n'), 'Number of files linted:', fileCount, '\n');
      }
    }

    function shouldThrowError() {
      return (
        messagesToLog.length
        && messagesToLog.some(function(message) {
          return message.type === 'warning' || message.type === 'error';
        })
      );
    }
  };
};
