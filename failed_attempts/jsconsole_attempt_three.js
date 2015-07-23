var dumperURL = 'https://localhost:1339/';
var globalDumpSequenceNumber = 0;

function dumpData(filename, contents) {
  var req = new XMLHttpRequest();
  req.open('POST', dumperURL+'?filename='+encodeURIComponent(filename));
  req.setRequestHeader('Content-Type', 'text/plain')
  req.send(contents);
}

// Make Facebook obtain 1000 messages at once.
var oldHTTPSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function() {
  console.log('arguments', arguments);
  if (arguments.length === 1) {
    var postData = arguments[0];
    var match = /messages\[user_ids\]\[[0-9]*\]\[limit\]=([0-9]*)/.exec(postData);
    if (match) {
      var matchStr = match[0];
      var comps = matchStr.split('=');
      comps[1] = 1000;
      arguments[0] = postData.replace(matchStr, comps.join('='));
      console.log('replace number of messages!');
    }
  }
  oldHTTPSend.apply(this, arguments);
};

// Make each thread_info.php request get dumped to our server.
var oldHTTPOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, async) {
  oldHTTPOpen.call(this, method, url, async);
  if (/thread_info.php$/.exec(url)) {
    var seq = ++globalDumpSequenceNumber;
    this.addEventListener('load', function() {
      var responseData = this.response.toString();
      dumpData('thread_info_' + seq + '.json', responseData);
    }.bind(this));
  }
};

function scrollUpInChat() {
  var messenger = document.getElementById('pagelet_web_messenger');
  var chatArea = messenger.getElementsByClassName('uiScrollableAreaWrap')[1];
  chatArea.scrollTop = 0;
}
setInterval(scrollUpInChat, 1000);
