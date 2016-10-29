// ["messages[user_ids][1331871570][offset]=21&messages[user_ids][1331871570][timestamp]=1437668262623&messages[user_ids][1331871570][limit]=20&&client=web_messenger&__user=1645882031&__a=1&__dyn=7AmajEyl35zZ29Q9UoHaEWC5ECiHxO4oyGhVoyeqrWU8popyUWdwIhEoyUnwPUS2O58kUgx-y28S7EC4U-8KuEOq6oS&__req=m&fb_dtsg=AQHeKHfhIfS1&ttstamp=26581721017572102104731028349&__rev=1849663"]

var dumperURL = 'https://localhost:1339/';
var globalDumpSequenceNumber = 0;
var scrollUpTimeout = null;

function dumpData(filename, contents) {
  var req = new XMLHttpRequest();
  req.open('POST', dumperURL+'?filename='+encodeURIComponent(filename));
  req.setRequestHeader('Content-Type', 'text/plain')
  req.send(contents);
}

var oldHTTPOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, async) {
  oldHTTPOpen.apply(this, arguments);
  if (/thread_info.php$/.exec(url)) {
    var seq = ++globalDumpSequenceNumber;
    this.addEventListener('load', function() {
      var responseData = this.response.toString();
      dumpData('thread_info_' + seq + '.json', responseData);
    }.bind(this));
  }
};

setInterval(function() {
  // Make sure message elements don't fill up the browser.
  // var messageGroups = document.getElementsByClassName('webMessengerMessageGroup');
  // var groupsArray = [];
  // for (var i = 0; i < messageGroups.length; ++i) {
  //   groupsArray[i] = messageGroups[i];
  // }
  // while (groupsArray.length > 50) {
  //   var last = groupsArray.pop();
  //   last.remove();
  // }

  var messenger = document.getElementById('pagelet_web_messenger');
  var chatArea = messenger.getElementsByClassName('uiScrollableAreaWrap')[1];
  var moreLink = chatArea.getElementsByClassName('uiMorePagerPrimary')[1];
  moreLink.click();
  chatArea.scrollTop = 0;
}, 1000);
