// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, (tabs) => {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * Change the background color of the current page.
 *
 * @param {string} color The new background color.
 */
function changeBackgroundColor(color) {
  var script = 'document.body.style.backgroundColor="' + color + '";';
  // See https://developer.chrome.com/extensions/tabs#method-executeScript.
  // chrome.tabs.executeScript allows us to programmatically inject JavaScript
  // into a page. Since we omit the optional first argument "tabId", the script
  // is inserted into the active tab of the current window, which serves as the
  // default.
  chrome.tabs.executeScript({
    code: script
  });
}

/**
 * Gets the saved background color for url.
 *
 * @param {string} url URL whose background color is to be retrieved.
 * @param {function(string)} callback called with the saved background color for
 *     the given url on success, or a falsy value if no color is retrieved.
 */
function getSavedBackgroundColor(url, callback) {
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
  // for chrome.runtime.lastError to ensure correctness even when the API call
  // fails.
  chrome.storage.sync.get(url, (items) => {
    callback(chrome.runtime.lastError ? null : items[url]);
  });
}

/**
 * Sets the given background color for url.
 *
 * @param {string} url URL for which background color is to be saved.
 * @param {string} color The background color to be saved.
 */
function saveBackgroundColor(url, color) {
  var items = {};
  items[url] = color;
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We omit the
  // optional callback since we don't need to perform any action once the
  // background color is saved.
  chrome.storage.sync.set(items);
}

// This extension loads the saved background color for the current tab if one
// exists. The user can select a new background color from the dropdown for the
// current page, and it will be saved as part of the extension's isolated
// storage. The chrome.storage API is used for this purpose. This is different
// from the window.localStorage API, which is synchronous and stores data bound
// to a document's origin. Also, using chrome.storage.sync instead of
// chrome.storage.local allows the extension data to be synced across multiple
// user devices.
document.addEventListener('DOMContentLoaded', () => {
  // TODO(ydich): Set var: wallet to database query.
  var wallet = 20 // testing purposes here only
  var payment;
  update();

  function update() {
    // wallet = ?
    document.getElementById("wallet").innerHTML = "$" + wallet;
    if (wallet < 5) {
      var remainder = 5 - wallet;
      document.getElementById("remainder").innerHTML = "<b>$" + remainder + "</b> until $5.";
      document.getElementById("donateButton").innerHTML = "Round up to $5 and donate now!"
      payment = 5
    } else {
      document.getElementById("remainder").innerHTML = "";
      document.getElementById("donateButton").innerHTML = "Donate now!";
      payment = wallet
    }
    document.getElementById("donateButton").addEventListener("click", pay);
  }

  function pay() {
    // TODO: authentication
    $.ajax({
      url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
      type: 'POST',
      data: 'grant_type=client_credentials',
      headers: {
        "Accept-Language": "en_US",
        "Accept": "application/json",
        Authorization: "Basic " + btoa("AemE0f6yNJ_xqCkWQ4SqYqrd799WNpvnFBFSna9vnglagxms0of4frC8E5MAL5uJPsYD8sLJHVChVzAb:EAnNySUm_KDfDDEuqA9IX8zLYrJS3ybP39md8ZNnE2L5DBLAxjCS8GEZ2WujANS2i04pvvoqihN_kRhS")
      },
      dataType: 'json',
      success: function(data) {
        console.log(data.access_token);
      },
      error: function(xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
        console.log(xhr.responseText);
      }
    });
    // TODO: Call payment API.
    $.ajax({
      url: 'https://api.sandbox.paypal.com/v1/payments/payment',
      type: 'POST',
      data: JSON.stringify({
        intent: "sale",
        payer: {
          payment_method: "paypal"
        },
        transactions: [{
          "amount": {
            "total": "30.11",
            "currency": "USD",
            "details": {
              "subtotal": "30.00",
              "tax": "0.07",
              "shipping": "0.03",
              "handling_fee": "1.00",
              "shipping_discount": "-1.00",
              "insurance": "0.01"
            }
          },
          "description": "The payment transaction description.",
          "custom": "EBAY_EMS_90048630024435",
          "invoice_number": "48787589673",
          "payment_options": {
            "allowed_payment_method": "INSTANT_FUNDING_SOURCE"
          },
          "soft_descriptor": "ECHI5786786",
          "item_list": {
            "items": [{
                "name": "hat",
                "description": "Brown hat.",
                "quantity": "5",
                "price": "3",
                "tax": "0.01",
                "sku": "1",
                "currency": "USD"
              },
              {
                "name": "handbag",
                "description": "Black handbag.",
                "quantity": "1",
                "price": "15",
                "tax": "0.02",
                "sku": "product34",
                "currency": "USD"
              }
            ],
            "shipping_address": {
              "recipient_name": "Brian Robinson",
              "line1": "4th Floor",
              "line2": "Unit #34",
              "city": "San Jose",
              "country_code": "US",
              "postal_code": "95131",
              "phone": "011862212345678",
              "state": "CA"
            }
          }
        }],
        note_to_payer: "Contact us for any questions on your order.",
        redirect_urls: {
          return_url: "https://www.paypal.com/return",
          cancel_url: "https://www.paypal.com/cancel"
        }
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer A21AAHOfr1hgTKHQ41XftovWfp06ozwmDsmxKSGTZYG9ASSamVks9Ufn88AAMp0sR4vzfPpacZ1RQHgx0hemSr9al7o8JZt5Q"
      },
      dataType: 'json',
      success: function(data) {
        console.log(data);
      },
      error: function(xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
        console.log(xhr.responseText);
      }
    });
    // console.log($);
    // $.post("https://api.sandbox.paypal.com/v1/payments/payment", {})
    //   .done(function(data) {console.log(data);});
    // Reset all. TODO: Reset value in database too.
    wallet = 0
    update();
  }

  // var wallet = 20
  // document.getElementById("wallet").innerHTML = "$" + wallet;
  // if (wallet < 5) {
  //   var remainder = 5 - wallet;
  //   document.getElementById("remainder").innerHTML = "<b>$" + remainder + "</b> until $5.";
  //   document.getElementById("donateButton").innerHTML = "Round up to $5 and donate now!"
  //   var payment = 5
  // } else {
  //   document.getElementById("remainder").innerHTML = "";
  //   document.getElementById("donateButton").innerHTML = "Donate now!";
  //   var payment = wallet
  // }
  // document.getElementById("donateButton").addEventListener("click", pay);

  // getCurrentTabUrl((url) => {
  //   var dropdown = document.getElementById('dropdown');
  //
  //   // // Load the saved background color for this page and modify the dropdown
  //   // // value, if needed.
  //   // getSavedBackgroundColor(url, (savedColor) => {
  //   //   if (savedColor) {
  //   //     changeBackgroundColor(savedColor);
  //   //     dropdown.value = savedColor;
  //   //   }
  //   // });
  //   //
  //   // // Ensure the background color is changed and saved when the dropdown
  //   // // selection changes.
  //   // dropdown.addEventListener('change', () => {
  //   //   changeBackgroundColor(dropdown.value);
  //   //   saveBackgroundColor(url, dropdown.value);
  //   // });
  // });
});
