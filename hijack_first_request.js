(function() {
  var globalDumpSequenceNumber = 0;
  var dumperURL = 'https://localhost:1339/';

  function dumpData(contents) {
    var req = new XMLHttpRequest();
    var filename = 'dump_' + (++globalDumpSequenceNumber) + '.js';
    req.open('POST', dumperURL+'?filename='+encodeURIComponent(filename), false);
    req.setRequestHeader('Content-Type', 'text/plain')
    req.send(contents);
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

  function listenForFirstUpdate() {
    var oldHTTPOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async) {
      oldHTTPOpen.apply(this, arguments);
      var oldSend = this.send;
      var postedData;
      this.send = function(postData) {
        oldSend.apply(this, arguments);
        postedData = new PostData(postData);
      }.bind(this);
      if (/thread_info.php$/.exec(url)) {
        this.addEventListener('load', function() {
          var responseData = this.response.toString();
          XMLHttpRequest.prototype.open = oldHTTPOpen;
          try {
            gotFirstUpdate(responseData, postedData);
          } catch (e) {
            console.log('got error', e);
          }
        }.bind(this));
      }
    };
  }

  function gotFirstUpdate(data, postData) {
    console.log('got first piece of data!', data.length, 'bytes; post:', postData);
    while (true) {
      var actions = parseActions(data);
      console.log('got', actions.length, 'actions');
      dumpData(data);

      if (actions.length <= 1) {
        break;
      }

      postData.setFields({
        offset: postData.getField('offset') + postData.getField('limit'),
        limit: 500,
        timestamp: actions[0].timestamp
      });

      var request = new XMLHttpRequest();
      request.open('POST', '/ajax/mercury/thread_info.php', false);
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      request.send(postData.data);
      data = request.responseText;
    }
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

  listenForFirstUpdate();
  console.log('scroll up in a chat until it loads more messages.');
})();
