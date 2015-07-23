(function() {
  function listenForFirstUpdate() {
    var oldHTTPOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async) {
      console.log('async is', async);
      oldHTTPOpen.call(this, method, url, async);
      return;
      if (/thread_info.php$/.exec(url)) {
        var seq = ++globalDumpSequenceNumber;
        this.addEventListener('load', function() {
          var responseData = this.response.toString();
          XMLHttpRequest.prototype.open = oldHTTPOpen;
          gotFirstUpdate(parsePayload(responseData));
        }.bind(this));
      }
    };
  }

  function gotFirstUpdate(payload) {
    console.log('got first payload');
  }

  function parsePayload(responseData) {
    var str = responseData.toString();
    var lines = str.split('\n');
    lines.shift();
    str = lines.join('\n');
    var parsed = JSON.parse(str);
    return parsed.payload;
  }

  listenForFirstUpdate();
  console.log('scroll up in a chat until it loads more messages.');
})();
