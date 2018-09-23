const PRIVATE_KEY_UNKNOWN = "***************************************************";

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get({
    account: "",
    publicKey: ""
  }, (items) => {
    document.getElementById('account').value = items.account;
    document.getElementById('publicKey').value = items.publicKey;
    if (items.publicKey) {
      document.getElementById('privateKey').value = PRIVATE_KEY_UNKNOWN;
    } else {
      document.getElementById('privateKey').value = "";
    }
  });
});

document.getElementById('publicKey').addEventListener('onchange', () => {
  if (privateKey.value == PRIVATE_KEY_UNKNOWN) {
    privateKey.value = "";
  }
});

document.getElementById('save').addEventListener('click', () => {
  var account = document.getElementById('account').value;
  var publicKey = document.getElementById('publicKey').value;
  var privateKey = document.getElementById('privateKey').value;
  var status = document.getElementById('status');
  var data = {account: account, publicKey: publicKey};
  if (privateKey != PRIVATE_KEY_UNKNOWN) {
    data.privateKey = privateKey;
  }
  chrome.storage.sync.set(data, () => {
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);
  });
});

document.getElementById('clear').addEventListener('click', () => {
  chrome.storage.sync.get({
    account: "",
    publicKey: "",
    privateKey: ""
  }, (items) => {
    chrome.storage.sync.clear(() => {
      chrome.storage.sync.set(items);
    });
  });
});
