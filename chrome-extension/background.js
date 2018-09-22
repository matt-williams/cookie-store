const NOTIFICATION_ID = "CookieStore";

chrome.runtime.onInstalled.addListener(function() {
  chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
      cookieStore = details.responseHeaders.find(function(e) {return e.name == "X-CookieStore";});
      console.log(cookieStore);
      if (cookieStore) {
        var update = {}
        update[cookieStore.value] = 1;
        chrome.storage.sync.set(update);

        var notification = chrome.notifications.create(NOTIFICATION_ID, {
          "type": "basic",
	  "iconUrl": "images/cookie48.png",
	  "title": "Share your identity for $0.5?",
	  "message": "site1.cookie-store.uk.to wants to know your identity on this site - share it for $0.5?",
	  "buttons": [
            {
              "title": "Accept",
              "iconUrl":  "images/tick16.png"
            },
            {
              "title": "Ignore",
              "iconUrl":  "images/cross16.png"
            }
	  ]
	});
      }
    },
    {urls: ["*://*/*"]},
    ["responseHeaders"]);
  chrome.notifications.onButtonClicked.addListener(function(id, button) {
    if (id == NOTIFICATION_ID) {
      chrome.notifications.clear(NOTIFICATION_ID);
      alert((button == 0) ? "Accepted" : "Ignored");
    }
  });
});
