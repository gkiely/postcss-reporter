var test = require('tape');
var _ = require('lodash');
var reporter = require('../lib/reporter');

var mockSimpleResult = {
  messages: [
    {
      type: 'warning',
      plugin: 'foo',
      text: 'foo warning',
    },
    {
      type: 'warning',
      plugin: 'bar',
      text: 'bar warning',
    },
    {
      type: 'warning',
      plugin: 'baz',
      text: 'baz warning',
    },
    {
      type: 'error',
      plugin: 'baz',
      text: 'baz error',
    },
  ],
  root: {
    source: {
      input: {
        id: '<input css 1>',
      },
    },
  },
};

test('reporter with simple mock result', function(t) {
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
  });
  t.doesNotThrow(function() {
    testReporter(null, mockSimpleResult);
  });
  t.deepEqual(tracker.messages, mockSimpleResult.messages);
  t.equal(tracker.source, '<input css 1>');
  t.end();
});

test('reporter with simple mock result and specified plugin', function(t) {
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
    plugins: ['foo', 'bar'],
  });
  testReporter(null, mockSimpleResult);
  t.deepEqual(
    tracker.messages,
    [
      {
        type: 'warning',
        plugin: 'foo',
        text: 'foo warning',
      },
      {
        type: 'warning',
        plugin: 'bar',
        text: 'bar warning',
      },
    ]
  );
  t.equal(tracker.source, '<input css 1>');
  t.end();
});

test('reporter with simple mock result and clearMessages', function(t) {
  var cloneResult = _.cloneDeep(mockSimpleResult);
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
    clearMessages: true,
  });
  testReporter(null, cloneResult);
  t.deepEqual(cloneResult.messages, []);
  t.end();
});

test('reporter with simple mock result, specified plugins, and clearMessages', function(t) {
  var cloneResult = _.cloneDeep(mockSimpleResult);
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
    plugins: ['baz', 'foo'],
    clearMessages: true,
  });
  testReporter(null, cloneResult);
  t.deepEqual(
    cloneResult.messages,
    [
      {
        type: 'warning',
        plugin: 'bar',
        text: 'bar warning',
      },
    ]
  );
  t.end();
});

test('reporter with simple mock result and throwError', function(t) {
  var cloneResult = _.cloneDeep(mockSimpleResult);
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
    throwError: true,
  });
  t.throws(function() {
    testReporter(null, cloneResult);
  });
  t.end();
});

function mockFormatter(tracker) {
  return function(obj) {
    tracker.messages = obj.messages;
    tracker.source = obj.source;
    return 'bogus report';
  };
}

var mockResultFromFile = {
  messages: [
    {
      type: 'error',
      plugin: 'baz',
      text: 'baz error',
    },
  ],
  root: {
    source: {
      input: {
        file: '/path/to/file.css',
      },
    },
  },
};

test('reporter with mock containing file source', function(t) {
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
  });
  testReporter(null, mockResultFromFile);
  t.equal(tracker.source, '/path/to/file.css');
  t.end();
})

var mockResultNoSource = {
  messages: [
    {
      type: 'error',
      plugin: 'baz',
      text: 'baz error',
    },
  ],
  root: {},
};

test('reporter with mock containing no source', function(t) {
  var tracker = {};
  var testReporter = reporter({
    formatter: mockFormatter(tracker),
  });
  testReporter(null, mockResultNoSource);
  t.equal(tracker.source, '');
  t.end();
})

var mockWarningNodeResult = {
  messages: [
    {
      type: 'warning',
      plugin: 'foo',
      text: 'foo warning',
      node: {
        source: {
          input: {
            file: 'foo.css',
          },
        },
      },
    },
    {
      type: 'warning',
      plugin: 'baz',
      text: 'baz warning',
      node: {
        source: {
          input: {
            file: 'bar.css',
          },
        },
      },
    },
    {
      type: 'error',
      plugin: 'pat',
      text: 'pat error',
      node: {
        source: {
          input: {
            id: '<input css 2>',
          },
        },
      },
    },
    {
      type: 'warning',
      plugin: 'bar',
      text: 'bar warning',
      node: {
        source: {
          input: {
            file: 'foo.css',
          },
        },
      },
    },
    {
      type: 'error',
      plugin: 'hoo',
      text: 'hoo error',
      node: {
        source: {
          input: {
            id: '<input css 2>',
          },
        },
      },
    },
    {
      type: 'error',
      plugin: 'hah',
      text: 'hah error',
    },
  ],
  root: {
    source: {
      input: {
        id: '<input css 1>',
      },
    },
  },
};

function mockMultiSourceFormatter(tracker) {
  return function(obj) {
    tracker.push(obj);
    return 'bogus report';
  };
}

test('reporter with warnings that messages that each have nodes', function(t) {
  var tracker = [];
  var testReporter = reporter({
    formatter: mockMultiSourceFormatter(tracker),
  });
  testReporter(null, mockWarningNodeResult);
  t.deepEqual(tracker, [
    {
      source: 'foo.css',
      messages: [
        {
          type: 'warning',
          plugin: 'foo',
          text: 'foo warning',
          node: {
            source: {
              input: {
                file: 'foo.css',
              },
            },
          },
        },
        {
          type: 'warning',
          plugin: 'bar',
          text: 'bar warning',
          node: {
            source: {
              input: {
                file: 'foo.css',
              },
            },
          },
        },
      ],
    },
    {
      source: 'bar.css',
      messages: [
        {
          type: 'warning',
          plugin: 'baz',
          text: 'baz warning',
          node: {
            source: {
              input: {
                file: 'bar.css',
              },
            },
          },
        },
      ],
    },
    {
      source: '<input css 2>',
      messages: [
        {
          type: 'error',
          plugin: 'pat',
          text: 'pat error',
          node: {
            source: {
              input: {
                id: '<input css 2>',
              },
            },
          },
        },
        {
          type: 'error',
          plugin: 'hoo',
          text: 'hoo error',
          node: {
            source: {
              input: {
                id: '<input css 2>',
              },
            },
          },
        },
      ],
    },
    {
      source: '<input css 1>',
      messages: [
        {
          type: 'error',
          plugin: 'hah',
          text: 'hah error',
        },
      ],
    },
  ]);
  t.end();
});
