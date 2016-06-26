var running = false;
var savePath = '';

function gotMessage(request, sender, sendResponse) {
  switch (request.action) {
  case 'running?':
    sendResponse({running: running, path: savePath});
    break;
  case 'start':
    running = true;
    savePath = request.path;
    break;
  case 'stop':
    running = false;
    break;
  }
}

chrome.runtime.onMessage.addListener(gotMessage);
