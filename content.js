// Initialize Firebase
var config = {
  apiKey: "AIzaSyCEVBQEHtw6q0VZV8-G0jbOTfAuresxXmI",
  authDomain: "heartofgold-2496d.firebaseapp.com",
  databaseURL: "https://heartofgold-2496d.firebaseio.com",
  projectId: "heartofgold-2496d",
  storageBucket: "heartofgold-2496d.appspot.com",
  messagingSenderId: "536324270949"
};
firebase.initializeApp(config);

// Returns negative number if not a transaction page. Otherwise gets price.
function getPrice() {
  var elts = document.getElementsByClassName("grand-total-price");
  if (elts.length) {
    var total = elts[0].innerHTML;
    total = Number(total.replace(/[^0-9\.-]+/g,""));
    return parseFloat(total);
  }
  return -1;
};

function getRoundUp(total) {
  return parseFloat((Math.ceil(total) - total).toFixed(2));
};

function checkPage() {
  var price = getPrice();
  if (price > 0) {
    found = true;
    var roundUp = getRoundUp(price);
    if (confirm("You can round up and donate " + roundUp.toString() + ". Press OK to add to your donation wallet, or cancel to exit.")) {
      // TODO: Generate ID
      chrome.storage.sync.get("userId", 
        function (ID) {
          if (!ID) {
            var cur = firebase.database().ref(ID).child("amount").once("value");
            cur.then(function(snapshot) {
              var snap = snapshot.val();
              if (isNaN(snap)) {
                return 0;
              }
              return snap;
            }).then(function(value) {
              firebase.database().ref(ID).child("amount").set(value + roundUp);
            })
          }
        });
    }
  }
}

var found = false;
checkPage();
document.addEventListener("DOMSubtreeModified", function(event){
  if (!found) {
    checkPage();
  }
});
