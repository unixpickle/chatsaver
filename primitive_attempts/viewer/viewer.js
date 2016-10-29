(function() {

  $(function() {
    var $messages = $('#messages');
    $messages.detach();
    for (var i = 0, len = window.allFacebookMessages.length; i < len; ++i) {
      var message = window.allFacebookMessages[i];
      $messages.append(createMessageElement(message));
    }
    $(document.body).append($messages);
  });

  function createMessageElement(message) {
    var $res = $('<div class="message"><span class="author"></span><span class="date"></span>' +
      '<span class="body"></span></div>');
    $res.find('.author').text(message.author);
    $res.find('.date').text(new Date(message.timestamp).toString());
    $res.find('.body').text(message.body);
    if (hasRealAttachments(message)) {
      var $a = $('<div class="attachments"><label class="attachments-label">Attachments</label>' +
        '</div>');
      $res.append($a);
      for (var i = 0, len = message.attachments.length; i < len; ++i) {
        var attachment = message.attachments[i];
        var useURL;
        switch (attachment.attach_type) {
        case 'photo':
          useURL = attachment.hires_url;
          break;
        case 'video':
        case 'sticker':
          useURL = attachment.url;
          break;
        default:
          useURL = attachment.url || attachment.preview_url;
          break;
        }
        if (useURL[0] === '/') {
          useURL = 'https://www.facebook.com' + useURL;
        }
        $a.append($('<a class="attachment"></a>').attr('href', useURL).text(useURL));
      }
      $res.addClass('message-with-attachment');
    } else {
      $res.addClass('message-without-attachment');
      if (!message.body) {
        $res.find('.body').html('<span class="error">This type of message cannot be processed ' +
          'at this time</span>');
      }
    }
    return $res;
  }

  function hasRealAttachments(message) {
    if (!message.attachments) {
      return false;
    }
    for (var i = 0; i < message.attachments.length; ++i) {
      if (message.attachments[i].attach_type !== 'share') {
        return true;
      }
    }
    return false;
  }

})();
