

var config = {
  apiKey: 'AIzaSyCEVBQEHtw6q0VZV8-G0jbOTfAuresxXmI',
  authDomain: 'heartofgold-2496d.firebaseapp.com',
  databaseURL: 'https://heartofgold-2496d.firebaseio.com',
  projectId: 'heartofgold-2496d',
  storageBucket: 'heartofgold-2496d.appspot.com',
  messagingSenderId: '536324270949'
};
firebase.initializeApp(config);

var currentUser;

function viewSwitcher(id) {
  const contentBoxes = Array.from(document.querySelectorAll('.content'));
  const element = document.querySelector(`#${id}`);

  contentBoxes.forEach(el => {
    el.hidden = true;
  });

  element.hidden = false;
}

/**
 * initApp handles setting up the Firebase context and registering
 * callbacks for the auth status.
 *
 * The core initialization is in firebase.App - this is the glue class
 * which stores configuration. We provide an app name here to allow
 * distinguishing multiple app instances.
 *
 * This method also registers a listener with
 * firebase.auth().onAuthStateChanged. This listener is called when the user is
 * signed in or out, and that is where we update the UI.
 *
 * When signed in, we also authenticate to the Firebase Realtime Database.
 */
function initApp() {
  return new Promise((resolve, reject) => {
    // Listen for auth state changes.
    // [START authstatelistener]
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        currentUser = user;
        // User is signed in.
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;
        // [START_EXCLUDE]
        // document.getElementById('quickstart-button').textContent = 'Sign
        // out';
        viewSwitcher('signed-in-content')
      } else {
        // Let's try to get a Google auth token programmatically.
        // [START_EXCLUDE]
        // document.getElementById('quickstart-button').textContent =
        //    'Sign-in with Google';
        // [END_EXCLUDE]
      }
      document.getElementById('quickstart-button')
        .addEventListener('click', startSignIn, false);
      resolve();
    });
    // [END authstatelistener]
  });
}

/**
 * Start the auth flow and authorizes to Firebase.
 * @param{boolean} interactive True if the OAuth flow should request with an interactive mode.
 */
function startAuth(interactive) {
  // Request an OAuth token from the Chrome Identity API.
  chrome.identity.getAuthToken({
    interactive: !!interactive
  }, function(token) {
    if (chrome.runtime.lastError && !interactive) {
      console.log('It was not possible to get a token programmatically.');
    } else if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else if (token) {
      // Authrorize Firebase with the OAuth Access Token.
      var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
      firebase.auth().signInWithCredential(credential).catch(function(error) {
        // The OAuth token might have been invalidated. Lets' remove it from
        // cache.
        if (error.code === 'auth/invalid-credential') {
          chrome.identity.removeCachedAuthToken({
            token: token
          }, function() {
            startAuth(interactive);
          });
        }
      });
    } else {
      console.error('The OAuth Token was null');
    }
  });
}

/**
 * Starts the sign-in process.
 */
function startSignIn() {
  console.log('startSignIn');
  document.getElementById('quickstart-button').disabled = true;
  if (firebase.auth().currentUser) {
    firebase.auth().signOut().then(() => {
      currentUser = null;
      viewSwitcher('signed-out-content');
    });
  } else {
    startAuth(true);
  }
}

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


window.onload = function() {
  initApp().then(async() => {

    // Set var: wallet to database query.
    var wallet = await firebase.database().ref(currentUser.uid).child("amount").once("value").then(function(snapshot) {
      // The Promise was "fulfilled" (it succeeded).
      return snapshot.val();
    }, function(error) {
      // The Promise was rejected.
      console.error(error);
    });
    // testing purposes here only
    console.log(wallet);
    // Set var: wallet to database query.
    var history = await firebase.database().ref(currentUser.uid).child("history").once("value").then(function(snapshot) {
      // The Promise was "fulfilled" (it succeeded).
      return snapshot.val();
    }, function(error) {
      // The Promise was rejected.
      console.error(error);
    });

    // Set var: wallet to database query.
    var charity = await firebase.database().ref(currentUser.uid).child("charity").once("value").then(function(snapshot) {
      // The Promise was "fulfilled" (it succeeded).
      return snapshot.val();
    }, function(error) {
      // The Promise was rejected.
      console.error(error);
    });

    var payment;
    var access_token;
    //Query clientID, secret, charity.
    var clientId;
    var secret;
    var history;
    update();

    function update() {
      // wallet = ?, query
      document.getElementById("wallet").innerHTML = "$" + wallet;
      if (wallet < 5) {
        var remainder = 5 - wallet;
        document.getElementById("before").innerHTML = "That's ";
        document.getElementById("remainder").innerHTML = "<b>$" + remainder + "</b>";
        document.getElementById("until").innerHTML = " until $5!"
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
      document.getElementById("stat").innerHTML = "$" + history;
      document.getElementById("charity").innerHTML = charity;
    }

    function signOut() {
      firebase.auth().signOut().then(function() {
          currentUser = null;
          viewSwitcher('signed-out-content');
        })
        .catch(function(error) {
          console.error('Sign Out Error', error);
        });
    }


    function updateSettings() {
      // Query here too.
      clientId = $('#clientid').val();
      console.log(clientId);
      secret = $('#secret').val();
      console.log(secret);
      charity = $('#charities').val();
      console.log(charity);
      firebase.database()
        .ref(currentUser.uid)
        .child('clientId')
        .set(clientId);
      firebase.database()
          .ref(currentUser.uid)
          .child('secret')
          .set(secret);
      firebase.database()
        .ref(currentUser.uid)
        .child('charity')
        .set(charity);
      document.getElementById("charity").innerHTML = charity;
    }

    function pay() {
      var access_token;
      var header;
      var donation_id;
      if (wallet < 5) {
        payment = 5;
      } else {
        payment = wallet;
      }
      console.log(payment);
      // TODO: Pass authentication needs (client id, secret key) from
      // form/database to call.
      $.ajax({
        url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
        async: false,
        type: 'POST',
        data: 'grant_type=client_credentials',
        headers: {
          'Accept-Language': 'en_US',
          'Accept': 'application/json',
          Authorization: 'Basic ' +
            btoa(
              'AemE0f6yNJ_xqCkWQ4SqYqrd799WNpvnFBFSna9vnglagxms0of4frC8E5MAL5uJPsYD8sLJHVChVzAb:EAnNySUm_KDfDDEuqA9IX8zLYrJS3ybP39md8ZNnE2L5DBLAxjCS8GEZ2WujANS2i04pvvoqihN_kRhS')
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
      header = 'Bearer ' + access_token;

      // TODO: Call payment API.
      $.ajax({
        url: 'https://api.sandbox.paypal.com/v1/payments/payment',
        async: false,
        type: 'POST',
        data: JSON.stringify({
          intent: 'sale',
          payer: {
            payment_method: 'paypal'
          },
          transactions: [{
            'amount': {
              'total': payment.toString(),
              'currency': 'USD'
            },
            'description': 'Heart of Gold charity donation.',
            'payment_options': {
              'allowed_payment_method': 'INSTANT_FUNDING_SOURCE'
            },
            'item_list': {
              'items': [{
                'name': 'donation',
                'description': 'Donation to charity',
                'quantity': '1',
                'price': payment.toString(),
                'currency': 'USD'
              }],
              'shipping_address': {
                'recipient_name': 'Brian Robinson',
                'line1': '4th Floor',
                'line2': 'Unit #34',
                'city': 'San Jose',
                'country_code': 'US',
                'postal_code': '95131',
                'phone': '011862212345678',
                'state': 'CA'
              }
            }
          }],
          note_to_payer: 'Contact us for any questions on your order.',
          redirect_urls: {
            return_url: 'https://www.paypal.com/return',
            cancel_url: 'https://www.paypal.com/cancel'
          }
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: header
          },
          dataType: 'json',
          success: function(data) {
            console.log(data);
            donation_id = data.id;
            document.getElementById('savings').innerHTML =
              'Your payment (ID: ' + donation_id +
              ') has been created and can be approved through your PayPal account. Thanks for donating!';
          },
          error: function(xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
            console.log(xhr.responseText);
          }
        });
      console.log(payment);
      if (currentUser) {
        var cur = firebase.database()
          .ref(currentUser.uid)
          .child('history')
          .once('value');
        var paymenta = payment;
        console.log(paymenta);
        cur.then(function(snapshot) {
            var snap = snapshot.val();
              if (isNaN(parseFloat(snap, 10))) {
                return 0;
              }
              return snap;
            })
            .then(function(value) {
              console.log(value);
              console.log(paymenta);
              return firebase.database()
                .ref(currentUser.uid)
                .child('history')
                .set(value + paymenta);
            });
        }
          wallet = 0;
          firebase.database()
            .ref(currentUser.uid)
            .child('amount')
            .set(0);
          payment = 0;
          update();
        };
      })
};
// Returns negative number if not a transaction page. Otherwise gets
// price.
function getPrice() {
  var elts = document.getElementsByClassName('grand-total-price');
  if (elts.length) {
    var total = elts[0].innerHTML;
    total = Number(total.replace(/[^0-9\.-]+/g, ''));
    return parseFloat(total);
  }
  return -1;
};

function getRoundUp(total) {
  return parseFloat((Math.ceil(total) - total).toFixed(2));
};

function addMoney(roundUp) {
  if (currentUser) {
    var cur = firebase.database()
      .ref(currentUser.uid)
      .child('amount')
      .once('value');
    cur.then(function(snapshot) {
        var snap = snapshot.val();
        if (isNaN(parseFloat(snap, 10))) {
          return 0;
        }
        return snap;
      })
      .then(function(value) {
        return firebase.database()
          .ref(currentUser.uid)
          .child('amount')
          .set(value + roundUp);
      });
  }
}

chrome.runtime.onMessage.addListener(function(msg, sender) {
  // First, validate the message's structure
  if ((msg.from === 'content') && (msg.subject === 'float')) {
    // Enable the page-action for the requesting tab
    addMoney(msg.body);
  }
});



// This extension loads the saved background color for the current tab if one
// exists. The user can select a new background color from the dropdown for the
// current page, and it will be saved as part of the extension's isolated
// storage. The chrome.storage API is used for this purpose. This is different
// from the window.localStorage API, which is synchronous and stores data bound
// to a document's origin. Also, using chrome.storage.sync instead of
// chrome.storage.local allows the extension data to be synced across multiple
// user devices.
