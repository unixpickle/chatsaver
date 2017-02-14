# chatsaver

This is a suite of tools for archiving and processing large chat histories on Facebook Messenger.

# Chrome Extension

The [chrome_ext](chrome_ext) directory is an unpacked Chrome Extension for using the ["hijack first request" approach](primitive_attempts/README.md#the-hijack-first-request-approach). I suggest you use this, since it is much easier than manually injecting scripts and running Go programs. You can install it like you would install any [unpacked Chrome extension](https://developer.chrome.com/extensions/getstarted#unpacked).

# Command-line tool

If you know how to run programs written in the [Go programming language](https://golang.org), then you have another option. The [cmd/](cmd) directory contains a small command-line utility that uses my [fbmsgr](https://github.com/unixpickle/fbmsgr) package to archive a chat directly (i.e. without a browser). This is the most efficient and complete of all my tools, since it is based off of a fairly complete Messenger API.

# Primitive Attempts

Before I made a nice, elegant chrome extension, I had a hacky technique that would allow me to archive my chats. The history of this technique can be found in [primitive_attempts](primitive_attempts).

# The data

A message from Facebook's server is a JSON object. Here is an example (with some fields censored):

```json
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
```

# License

This is licensed under the BSD 2-clause license. See [LICENSE](LICENSE).
