// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */

 var config = {
  apiKey: "AIzaSyCEVBQEHtw6q0VZV8-G0jbOTfAuresxXmI",
  authDomain: "heartofgold-2496d.firebaseapp.com",
  databaseURL: "https://heartofgold-2496d.firebaseio.com",
  projectId: "heartofgold-2496d",
  storageBucket: "heartofgold-2496d.appspot.com",
  messagingSenderId: "536324270949"
};
firebase.initializeApp(config);

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
  var access_token;
  // TODO(ydich): Query clientID, secret, charity.
  var clientId;
  var secret;
  var charity;
  update();

  function update() {
    // wallet = ?, query
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
    document.getElementById("updateButton").addEventListener("click", updateSettings);
    document.getElementById("donateButton").addEventListener("click", pay);
    document.getElementById("signOut").addEventListener("click", signOut);

  }

  function signOut(){
    firebase.auth().signOut().then(function() {
      // this is where we can put to clear chrome storage 
      console.log('Signed Out');
    }, function(error) {
      console.error('Sign Out Error', error);
    });

  }
  function printSomething() {
    console.log("please work"); 
  }
  function updateSettings() {
    // Query here too.
    clientId = $('#clientid').val();
    console.log(clientId);
    secret = $('#secret').val();
    console.log(secret);
    charity = $('#charity').val();
    console.log(charity);
  }

  function pay() {
    var access_token;
    var header;
    var donation_id;

    // TODO: Pass authentication needs (client id, secret key) from form/database to call.
    $.ajax({
      url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
      async: false,
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
        access_token = data.access_token;
        console.log(access_token);
      },
      error: function(xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
        console.log(xhr.responseText);
      }
    });
    header = "Bearer " + access_token;

    // TODO: Call payment API.
    $.ajax({
      url: 'https://api.sandbox.paypal.com/v1/payments/payment',
      async: false,
      type: 'POST',
      data: JSON.stringify({
        intent: "sale",
        payer: {
          payment_method: "paypal"
        },
        transactions: [{
          "amount": {
            "total": payment.toString(),
            "currency": "USD"
          },
          "description": "Heart of Gold charity donation.",
          "payment_options": {
            "allowed_payment_method": "INSTANT_FUNDING_SOURCE"
          },
          "item_list": {
            "items": [{
                "name": "donation",
                "description": "Donation to charity",
                "quantity": "1",
                "price": payment.toString(),
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
        Authorization: header
      },
      dataType: 'json',
      success: function(data) {
        console.log(data);
        donation_id = data.id;
        document.getElementById("savings").innerHTML = "Your payment (ID: " + donation_id + ") has been created and can be approved through your PayPal account. Thanks for donating!";
      },
      error: function(xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
        console.log(xhr.responseText);
      }
    });

    // // Get pending payment details.
    // $.ajax({
    //   url: 'https://api.sandbox.paypal.com/v1/payments/payment/' + donation_id,
    //   type: 'GET',
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: header
    //   },
    //   dataType: 'json',
    //   success: function(data) {
    //     console.log(data);
    //     document.getElementById("savings").innerHTML = "Your payment (ID: " + donation_id + ") has been created and can be approved through your PayPal account. Thanks for donating!";
    //   },
    //   error: function(xhr, ajaxOptions, thrownError) {
    //     console.log(xhr.status);
    //     console.log(thrownError);
    //     console.log(xhr.responseText);
    //     console.log('https://api.sandbox.paypal.com/v1/payments/payment/' + donation_id);
    //   }
    // });

    // Reset all. TODO: Reset value in database too and add to history.
    // Maybe only accummulate total donations per month to avoid overflow?
    wallet = 0;
    payment = 0;
    //update();
  }
});
