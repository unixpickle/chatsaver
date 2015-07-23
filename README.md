# chatsaver

This program will scrape Facebook's website to make it possible to cache your full chat history with a given user.

# The scroll and intercept approach

Intuitively, it seems that the simplest way to cache a Facebook conversation is to scroll to the top of the chat. When you scroll up in a chat, Facebook's client-side JavaScript code sends a request to its server to download older messages. By intercepting the responses to these requests, it is possible to sniff the entire Facebook conversation as the users scrolls through it.

However, it is not very fun to scroll up through 30,000+ messages on Facebook Chat--especially since Facebook's client-side code only downloads 80 messages at a time. Luckily, it is possible to automate this task.

The script [scroll_and_intercept.js](scroll_and_intercept.js) periodically scrolls to the top of a chat and intercepts all of the Facebook's AJAX traffic. To use it, you must follow a number of convoluted steps. First, you must install the Chrome plugin "Disable Content-Security-Policy", making it possible to send AJAX requests to your instance of *data_dumper.go* from *facebook.com*. Next, you must setup [data_dumper.go](data_dumper.go) to run behind an HTTPS reverse-proxy. Finally, you must put the URL of your data_dumper instance into [scroll_and_intercept.js](scroll_and_intercept.js) and paste it into your JavaScript console while navigated to a Facebook conversation page.

A chat of about 38,000 messages took several hours for me to archive using this approach. Throughout the process, the Chrome tab used 100% CPU. In the end, I was receiving about 4 to 5 page updates per minute, meaning approximately 360 messages per minute.

I suspect that most of the overhead comes from the browser choking on thousands of DOM elements. The network activity was certainly not the strain, since the data itself added up to the whereabouts of 40MB.

# A browser-less approach

Facebook's client-side JavaScript code knows how to retrieve messages from the server. It should be possible to reverse engineer this protocol and do the same thing from a server-side application.

I predict that this approach would be significantly faster than the "scroll and intercept" approach. It would also use less bandwidth and could be run on a server for convenience.

# The data

A message from Facebook's server is a JSON object. Here is an example (with some fields censored):

    {
      "message_id":"mid.143......2121:24...........ea103",
      "threading_id":null,
      "offline_threading_id":"60300.........42707",
      "author":"fbid:13......70",
      "author_email":"13......70\u0040facebook.com",
      "timestamp":1437664312123,
      "timestamp_absolute":"Today",
      "timestamp_relative":"11:11am",
      "timestamp_datetime":"11:11am",
      "timestamp_time_passed":0,
      "is_unread":false,
      "is_forward":false,
      "is_filtered_content":false,
      "is_filtered_content_bh":false,
      "is_filtered_content_account":false,
      "forward_count":0,
      "forward_message_ids":[],
      "source":"source:chat:orca",
      "source_tags":["source:messenger","source:chat","source:mobile"],
      "is_spoof_warning":false,
      "folder":"inbox",
      "thread_fbid":"13......70",
      "other_user_fbid":13......70,
      "body":"Then when I woke up in my bed I was a bit confused",
      "html_body":null,
      "subject":null,
      "has_attachment":false,
      "attachments":[],
      "raw_attachments":null,
      "ranges":[],
      "thread_id":"4jKr............AWvxlQ",
      "action_id":"14.........44000000",
      "action_type":"ma-type:user-generated-message"
    }
