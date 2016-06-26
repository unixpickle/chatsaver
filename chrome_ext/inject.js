var running = false;
var awaitingFirst = false;
var currentRequest = null;
var fileIndex = 0;

function gotMessage(request, sender, sendResponse) {
  switch (request.action) {
  case 'running?':
    sendResponse({running: running});
    break;
  case 'start':
    awaitingFirst = true;
    running = true;
    break;
  case 'stop':
    running = false;
    if (currentRequest) {
      currentRequest.abort();
      currentRequest = null;
    }
    break;
  }
}

function dumpData(contents) {
  // Remove infinite JavaScript for-loop.
  contents = contents.substr(9);

  var fileName = fileIndex + '.json';
  fileIndex++;
  var msg = {
    filename: fileName,
    url: 'data:application/json;base64,' + btoa(contents)
  };
  chrome.runtime.sendMessage(msg, function(response) {
    console.log('got response', response);
  });
}

function PostData(data) {
  this.data = data;
}

PostData.prototype.getField = function(name) {
  var regexp = new RegExp('messages\\[user_ids\\]\\[[0-9]*\\]\\[' + name + '\\]=([0-9]*)');
  var match = regexp.exec(this.data);
  if (!match) {
    throw new Error('no field: ' + name);
  }
  return parseInt(match[1]);
};

PostData.prototype.setField = function(name, value) {
  var regexp = new RegExp('messages\\[user_ids\\]\\[[0-9]*\\]\\[' + name + '\\]=([0-9]*)');
  var match = regexp.exec(this.data);
  if (!match) {
    throw new Error('no field: ' + name);
  }
  var matchStr = match[0];
  var comps = matchStr.split('=');
  comps[1] = value;
  this.data = this.data.replace(matchStr, comps.join('='));
};

PostData.prototype.setFields = function(fields) {
  var keys = Object.keys(fields);
  for (var i = 0, len = keys.length; i < len; ++i) {
    this.setField(keys[i], fields[keys[i]]);
  }
};

function registerHTTPHook() {
  var s = document.createElement('script');
  s.src = chrome.extension.getURL('http_hook.js');
  s.onload = function() {
      this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
  window.addEventListener('message', function(e) {
    var data = e.data;
    if (data.hasOwnProperty('notFromFacebook')) {
      gotFirstUpdate(data.response, new PostData(data.post));
    }
  });
}

function gotFirstUpdate(data, postData) {
  if (!awaitingFirst) {
    return;
  }
  awaitingFirst = false;
  fetchLoop(data, postData);
}

function fetchLoop(data, postData) {
  if (!running) {
    return;
  }

  var actions = parseActions(data);
  console.log('got ' + actions.length + ' actions');
  dumpData(data);

  if (actions.length <= 1) {
    console.log('fetch complete');
    running = false;
    return;
  }

  postData.setFields({
    offset: postData.getField('offset') + postData.getField('limit'),
    limit: 500,
    timestamp: actions[0].timestamp
  });

  var request = new XMLHttpRequest();
  request.addEventListener('load', function() {
    currentRequest = null;
    fetchLoop(request.responseText, postData);
  });
  request.open('POST', '/ajax/mercury/thread_info.php', true);
  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  request.send(postData.data);
  currentRequest = request;
}

function parseActions(responseData) {
  var str = responseData.toString();
  var curlyIndex = str.indexOf('{');
  if (curlyIndex < 0) {
    throw new Error('no JSON object');
  }
  var parsed = JSON.parse(str.substr(curlyIndex));
  return parsed.payload.actions || [];
}

chrome.runtime.onMessage.addListener(gotMessage);
registerHTTPHook();
