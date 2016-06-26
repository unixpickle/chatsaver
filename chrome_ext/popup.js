var recording = false;
var runningTask = false;
var mainTab = null;

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  mainTab = tabs[0];
  var initRequest = {action: 'running?'};
  chrome.tabs.sendMessage(mainTab.id, initRequest, function(response) {
    if (runningTask || !response) {
      return;
    }
    runningTask = true;
    recording = response.running;
    if (recording) {
      document.getElementById('toggle-button').innerHTML = 'Stop';
    }
  });
});

document.getElementById('toggle-button').onclick = function() {
  if (recording) {
    document.getElementById('toggle-button').innerHTML = 'Start';
    stopRecording();
  } else {
    document.getElementById('toggle-button').innerHTML = 'Stop';
    startRecording();
  }
  recording = !recording;
};

function startRecording() {
  var startMsg = {action: 'start'};
  if (!runningTask) {
    runningTask = true;
    chrome.tabs.executeScript(mainTab.id, {file: 'inject.js'}, function() {
      chrome.tabs.sendMessage(mainTab.id, startMsg, function(response) {});
    });
  } else {
    chrome.tabs.sendMessage(mainTab.id, startMsg, function(response) {});
  }
}

function stopRecording() {
  chrome.tabs.sendMessage(mainTab.id, {action: 'stop'}, function(response) {});
}
