(function() {

  function notifyRequest(responseData, postData) {
    var payload = {
      response: responseData,
      post: postData,
      notFromFacebook: true
    };
    window.postMessage(payload, '*');
  }

  var oldHTTPOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, async) {
    oldHTTPOpen.apply(this, arguments);
    var oldSend = this.send;
    var postedData;
    this.send = function(postData) {
      oldSend.apply(this, arguments);
      postedData = postData;
    }.bind(this);
    if (/thread_info.php(\?.*)?$/.exec(url)) {
      this.addEventListener('load', function() {
        var responseData = this.response.toString();
        notifyRequest(responseData, postedData);
      }.bind(this));
    }
  };

})();
